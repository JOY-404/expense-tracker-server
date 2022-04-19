const express = require('express');
const router = express.Router();

// Controllers
const UserController = require('../controllers/UserController');

router.post('/signup', UserController.postAddNewUser);

router.post('/login', UserController.postLogin);

router.get('/authenticate', UserController.authenticate, (req, res) => {
    res.status(200).json({ success: true, msg: 'User Authenticated' });
})

module.exports = router;