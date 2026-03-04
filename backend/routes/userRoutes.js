const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.get('/all', adminMiddleware, getAllUsers);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', adminMiddleware, deleteUser);

module.exports = router;
