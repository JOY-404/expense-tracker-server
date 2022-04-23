const express = require('express');
const router = express.Router();

// Controllers
const PasswordController = require('../controllers/PasswordController');

router.post('/forgotpassword', PasswordController.postForgotPassword);

router.get('/resetpassword/:resetId', PasswordController.getResetPassword);

router.post('/resetpassword/:resetId', PasswordController.postResetPassword);

module.exports = router;