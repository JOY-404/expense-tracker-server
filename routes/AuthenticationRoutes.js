const express = require('express');
const router = express.Router();

// Controllers
const UserController = require('../controllers/UserController');

router.post('/signup', UserController.postAddNewUser);

module.exports = router;