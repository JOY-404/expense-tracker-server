const express = require('express');
const router = express.Router();

// Controllers
const ExpenseController = require('../controllers/ExpenseController');
const UserController = require('../controllers/UserController');
const PaymentController = require('../controllers/PaymentController');

router.post('/addexpense', UserController.authenticate, ExpenseController.postAddExpense);

router.get('/getcategory', UserController.authenticate, ExpenseController.getCategories);

router.post('/addcategory', UserController.authenticate, ExpenseController.postAddCategory);

router.post('/addcategory', UserController.authenticate, ExpenseController.postAddCategory);

router.post('/create-premium-order', UserController.authenticate, PaymentController.postCreatePremOrder);

router.post('/rzpay-success', UserController.authenticate, PaymentController.rzpaySuccess);

router.post('/rzpay-failure', UserController.authenticate, PaymentController.rzpayFailure);

module.exports = router;