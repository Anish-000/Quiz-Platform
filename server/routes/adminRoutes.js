const express = require('express');
const router = express.Router();
const {
    getDashboard, createQuiz, updateQuiz,
    deleteQuiz, addQuestion, getStudents, getAllResults
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, isAdmin, getDashboard);
router.get('/students', verifyToken, isAdmin, getStudents);
router.get('/results', verifyToken, isAdmin, getAllResults);
router.post('/quiz', verifyToken, isAdmin, createQuiz);
router.put('/quiz/:id', verifyToken, isAdmin, updateQuiz);
router.delete('/quiz/:id', verifyToken, isAdmin, deleteQuiz);
router.post('/quiz/:id/question', verifyToken, isAdmin, addQuestion);

module.exports = router;