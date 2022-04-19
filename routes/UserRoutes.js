const express = require('express');
const router = express.Router();

// Controllers
const ExpenseController = require('../controllers/ExpenseController');
const UserController = require('../controllers/UserController');

router.post('/addexpense', UserController.authenticate, ExpenseController.postAddExpense);

router.get('/getcategory', UserController.authenticate, ExpenseController.getCategories);

router.post('/addcategory', UserController.authenticate, ExpenseController.postAddCategory);

module.exports = router;