const express = require('express');
const router = express.Router();

// Controllers
const UserController = require('../controllers/UserController');

router.post('/signup', UserController.postAddNewUser);

router.post('/login', UserController.postLogin);

router.post('/password/forgotpassword', UserController.postResetPassword);

router.get('/authenticate', UserController.authenticate, (req, res) => {
    res.status(200).json({ success: true, msg: 'User Authenticated', isPremium: req.user.isPremiumMember });
})

module.exports = router;