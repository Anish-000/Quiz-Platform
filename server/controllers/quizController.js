const db = require('../config/db');

// Get all active quizzes
const getQuizzes = async (req, res) => {
    try {
        const [quizzes] = await db.query(`
            SELECT q.*, u.name as created_by_name,
            COUNT(DISTINCT qu.id) as total_questions
            FROM quizzes q
            LEFT JOIN users u ON q.created_by = u.id
            LEFT JOIN questions qu ON q.id = qu.quiz_id
            WHERE q.is_active = true
            GROUP BY q.id
            ORDER BY q.created_at DESC
        `);
        res.json(quizzes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching quizzes.' });
    }
};

// Get single quiz with questions
const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;

        const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [id]);
        if (quiz.length === 0) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        const [questions] = await db.query(`
            SELECT q.*, o.id as option_id, o.option_text
            FROM questions q
            LEFT JOIN options o ON q.id = o.question_id
            WHERE q.quiz_id = ?
            ORDER BY q.id, o.id
        `, [id]);

        // Structure questions with options
        const questionsMap = {};
        questions.forEach(row => {
            if (!questionsMap[row.id]) {
                questionsMap[row.id] = {
                    id: row.id,
                    question_text: row.question_text,
                    marks: row.marks,
                    options: []
                };
            }
            if (row.option_id) {
                questionsMap[row.id].options.push({
                    id: row.option_id,
                    option_text: row.option_text
                });
            }
        });

        res.json({
            quiz: quiz[0],
            questions: Object.values(questionsMap)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching quiz.' });
    }
};

// Start quiz attempt
const startQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if quiz exists
        const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ? AND is_active = true', [id]);
        if (quiz.length === 0) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // Check if already attempting
        const [existing] = await db.query(`
            SELECT * FROM quiz_attempts 
            WHERE user_id = ? AND quiz_id = ? AND is_completed = false
        `, [userId, id]);

        if (existing.length > 0) {
            return res.json({ attemptId: existing[0].id, message: 'Resuming existing attempt.' });
        }

        // Create new attempt
        const [result] = await db.query(`
            INSERT INTO quiz_attempts (user_id, quiz_id) VALUES (?, ?)
        `, [userId, id]);

        res.json({
            attemptId: result.insertId,
            timeLimit: quiz[0].time_limit,
            message: 'Quiz started!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error starting quiz.' });
    }
};

// Submit quiz
const submitQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { attemptId, answers, timeTaken } = req.body;

        // Verify attempt
        const [attempt] = await db.query(`
            SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ? AND is_completed = false
        `, [attemptId, userId]);

        if (attempt.length === 0) {
            return res.status(400).json({ message: 'Invalid or already completed attempt.' });
        }

        // Get correct answers
        const [questions] = await db.query(`
            SELECT q.id, q.marks, o.id as correct_option_id
            FROM questions q
            JOIN options o ON q.id = o.question_id
            WHERE q.quiz_id = ? AND o.is_correct = true
        `, [id]);

        // Calculate score
        let score = 0;
        let totalMarks = 0;
        const answerRecords = [];

        questions.forEach(question => {
            totalMarks += question.marks;
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer == question.correct_option_id;
            if (isCorrect) score += question.marks;

            answerRecords.push([
                attemptId,
                question.id,
                userAnswer || null,
                isCorrect
            ]);
        });

        // Save answers
        if (answerRecords.length > 0) {
            await db.query(`
                INSERT INTO answers (attempt_id, question_id, selected_option_id, is_correct)
                VALUES ?
            `, [answerRecords]);
        }

        // Update attempt
        await db.query(`
            UPDATE quiz_attempts SET is_completed = true, submitted_at = NOW() WHERE id = ?
        `, [attemptId]);

        // Save result
        const percentage = ((score / totalMarks) * 100).toFixed(2);
        await db.query(`
            INSERT INTO results (attempt_id, user_id, quiz_id, score, total_marks, percentage, time_taken)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [attemptId, userId, id, score, totalMarks, percentage, timeTaken]);

        res.json({
            message: 'Quiz submitted successfully!',
            score,
            totalMarks,
            percentage
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting quiz.' });
    }
};


// Get my results
const getMyResults = async (req, res) => {
    try {
        const userId = req.user.id;
        const [results] = await db.query(`
            SELECT r.*, q.title as quiz_title, qa.id as attempt_id
            FROM results r
            JOIN quizzes q ON r.quiz_id = q.id
            JOIN quiz_attempts qa ON r.attempt_id = qa.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [userId]);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching results.' });
    }
};

// Get single result by attemptId
const getResultByAttempt = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const [results] = await db.query(`
            SELECT r.*, q.title as quiz_title
            FROM results r
            JOIN quizzes q ON r.quiz_id = q.id
            WHERE r.attempt_id = ?
        `, [attemptId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Result not found.' });
        }

        const [questions] = await db.query(`
            SELECT q.id, q.question_text, a.selected_option_id, a.is_correct
            FROM questions q
            LEFT JOIN answers a ON q.id = a.question_id AND a.attempt_id = ?
            WHERE q.quiz_id = ?
        `, [attemptId, results[0].quiz_id]);

        for (let q of questions) {
            const [options] = await db.query(`
                SELECT id, option_text, is_correct
                FROM options WHERE question_id = ?
            `, [q.id]);
            q.options = options;
        }

        res.json({ result: results[0], questions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching result.' });
    }
};

module.exports = { getQuizzes, getQuizById, startQuiz, submitQuiz, getMyResults, getResultByAttempt };