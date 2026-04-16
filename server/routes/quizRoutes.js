const express = require('express');
const router = express.Router();
const {
    getQuizzes, getQuizById, startQuiz,
    submitQuiz, getMyResults, getResultByAttempt
} = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getQuizzes);
router.get('/my-results', verifyToken, getMyResults);
router.get('/results/:attemptId', verifyToken, getResultByAttempt);
router.get('/:id', verifyToken, getQuizById);
router.post('/:id/start', verifyToken, startQuiz);
router.post('/:id/submit', verifyToken, submitQuiz);

module.exports = router;