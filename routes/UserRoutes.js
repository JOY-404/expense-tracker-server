const express = require('express');
const router = express.Router();

// Controllers
const ExpenseController = require('../controllers/ExpenseController');
const UserController = require('../controllers/UserController');
const PaymentController = require('../controllers/PaymentController');

router.get('/getexpense', UserController.authenticate, ExpenseController.getExpense);

router.post('/addexpense', UserController.authenticate, ExpenseController.postAddExpense);

router.post('/update-expense/:expenseId', UserController.authenticate, ExpenseController.updateExpense);

router.delete('/delete-expense/:expenseId', UserController.authenticate, ExpenseController.deleteExpense);

router.get('/getcategory', UserController.authenticate, ExpenseController.getCategories);

router.post('/addcategory', UserController.authenticate, ExpenseController.postAddCategory);

router.post('/update-category/:categoryId', UserController.authenticate, ExpenseController.updateCategory);

router.delete('/delete-category/:categoryId', UserController.authenticate, ExpenseController.deleteCategory);

router.get('/leaderboard', UserController.authenticate, ExpenseController.getLeaderboard);

router.get('/leaderboard/:userId', UserController.authenticate, ExpenseController.getExpDtlsCatWise);

router.post('/create-premium-order', UserController.authenticate, PaymentController.postCreatePremOrder);

router.post('/rzpay-success', UserController.authenticate, PaymentController.rzpaySuccess);

router.post('/rzpay-failure', UserController.authenticate, PaymentController.rzpayFailure);

module.exports = router;