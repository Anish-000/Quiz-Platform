const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, startQuiz, submitQuiz } = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getQuizzes);
router.get('/:id', verifyToken, getQuizById);
router.post('/:id/start', verifyToken, startQuiz);
router.post('/:id/submit', verifyToken, submitQuiz);

module.exports = router;