const express = require('express')
const { register, login, update, resetPasswordLink, resetPassword } = require('../controllers/authControllers')
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update', verifyToken, update);
router.post('/forgot-password', resetPasswordLink);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
