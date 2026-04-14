const db = require('../config/db');

// Get admin dashboard stats
const getDashboard = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users WHERE role = "student"');
        const [[{ totalQuizzes }]] = await db.query('SELECT COUNT(*) as totalQuizzes FROM quizzes');
        const [[{ totalAttempts }]] = await db.query('SELECT COUNT(*) as totalAttempts FROM quiz_attempts WHERE is_completed = true');
        const [[{ avgScore }]] = await db.query('SELECT AVG(percentage) as avgScore FROM results');

        // Recent results
        const [recentResults] = await db.query(`
            SELECT r.*, u.name as student_name, q.title as quiz_title
            FROM results r
            JOIN users u ON r.user_id = u.id
            JOIN quizzes q ON r.quiz_id = q.id
            ORDER BY r.created_at DESC
            LIMIT 10
        `);

        // Top performers
        const [topPerformers] = await db.query(`
            SELECT u.name, AVG(r.percentage) as avg_percentage, COUNT(r.id) as total_attempts
            FROM results r
            JOIN users u ON r.user_id = u.id
            GROUP BY r.user_id
            ORDER BY avg_percentage DESC
            LIMIT 5
        `);

        res.json({
            stats: {
                totalUsers,
                totalQuizzes,
                totalAttempts,
                avgScore: avgScore ? parseFloat(avgScore).toFixed(2) : 0
            },
            recentResults,
            topPerformers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard data.' });
    }
};

// Create quiz
const createQuiz = async (req, res) => {
    try {
        const { title, description, time_limit } = req.body;
        const adminId = req.user.id;

        if (!title || !time_limit) {
            return res.status(400).json({ message: 'Title and time limit are required.' });
        }

        const [result] = await db.query(`
            INSERT INTO quizzes (title, description, time_limit, created_by)
            VALUES (?, ?, ?, ?)
        `, [title, description, time_limit, adminId]);

        res.status(201).json({
            message: 'Quiz created successfully!',
            quizId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating quiz.' });
    }
};

// Update quiz
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, time_limit, is_active } = req.body;

        await db.query(`
            UPDATE quizzes SET title = ?, description = ?, time_limit = ?, is_active = ?
            WHERE id = ?
        `, [title, description, time_limit, is_active, id]);

        res.json({ message: 'Quiz updated successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating quiz.' });
    }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM quizzes WHERE id = ?', [id]);

        res.json({ message: 'Quiz deleted successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting quiz.' });
    }
};

// Add question with options
const addQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question_text, marks, options } = req.body;

        if (!question_text || !options || options.length < 2) {
            return res.status(400).json({ message: 'Question and at least 2 options are required.' });
        }

        // Insert question
        const [question] = await db.query(`
            INSERT INTO questions (quiz_id, question_text, marks)
            VALUES (?, ?, ?)
        `, [id, question_text, marks || 1]);

        const questionId = question.insertId;

        // Insert options
        for (const option of options) {
            await db.query(`
                INSERT INTO options (question_id, option_text, is_correct)
                VALUES (?, ?, ?)
            `, [questionId, option.text, option.is_correct || false]);
        }

        res.status(201).json({ message: 'Question added successfully!', questionId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding question.' });
    }
};

module.exports = { getDashboard, createQuiz, updateQuiz, deleteQuiz, addQuestion };