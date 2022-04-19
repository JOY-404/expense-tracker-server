const Category = require('../models/category');
const Expense = require('../models/expense');

exports.postAddCategory = (req, res, next) => {
    const category = req.body.category;
    req.user.getCategories({ where: { category: category } })
        .then(categories => {
            if (categories.length > 0) {
                // Category already exists
                res.status(200).json({ success: false, msg: 'Duplicate' });
            }
            else {
                req.user.createCategory({ category: category })
                    .then(resp => res.status(200).json({ success: true, msg: 'Category Added Successfully' }))
                    .catch(err => res.status(500).json({ success: false, msg: err }));
            }
        })
        .catch(err => res.status(500).json({ success: false, msg: err }));
}

exports.getCategories = (req, res, next) => {
    req.user.getCategories({ order: [['category', 'ASC']] })
        .then(categories => {
            res.status(200).json(categories);
        })
        .catch(err => res.status(500).json({ success: false, msg: err }));
}

exports.postAddExpense = (req, res, next) => {
    req.user.createExpense({
        expenseDate: req.body.date,
        amount: req.body.amount,
        description: req.body.description,
        categoryId: req.body.categoryId
    })
        .then(expense => res.status(200).json({ expense: expense, success: true, msg: 'Expense Added Successfully' }))
        .catch(err => res.status(500).json({ success: false, msg: err }));
}