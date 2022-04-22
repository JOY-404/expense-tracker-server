const { Sequelize } = require('sequelize');
const Category = require('../models/category');
const Expense = require('../models/expense');
const sequelize = require('../util/database');

exports.postAddCategory = async (req, res, next) => {
    try {
        const category = req.body.category;
        // Find if there is any category with same name
        const count = await req.user.countCategories({ where: { category: category } });

        if (count > 0) {
            // Category already exists
            res.status(200).json({ success: false, msg: 'Duplicate' });
        }
        else {
            req.user.createCategory({ category: category })
                .then(resp => res.status(200).json({ success: true, msg: 'Category Added Successfully' }))
                .catch(err => res.status(500).json({ success: false, msg: err }));
        }
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.getCategories = (req, res, next) => {
    try {
        req.user.getCategories({ order: [['category', 'ASC']] })
            .then(categories => res.status(200).json(categories))
            .catch(err => res.status(500).json({ success: false, msg: err }));

    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.updateCategory = async (req, res, next) => {
    try {
        const catId = req.params.categoryId;
        const category = req.body.category;
        //console.log(req.user.__proto__);

        // Find if there is any category with same name
        const count = await req.user.countCategories({
            where: {
                category: category,
                id: { [Sequelize.Op.not]: catId }
            }
        });

        if (count > 0) {
            // Category already exists
            res.status(200).json({ success: false, msg: 'Duplicate' });
        }
        else {
            Category.findByPk(catId)
                .then(fetchedCat => {
                    fetchedCat.category = category;
                    return fetchedCat.save();
                })
                .then(resp => {
                    res.status(200).json({ success: true, msg: 'Updated Successfully' });
                })
                .catch(err => res.status(500).json({ success: false, msg: err }));
        }
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.deleteCategory = async (req, res, next) => {
    try {
        const catId = req.params.categoryId;
        // Find if there is any category with same name
        const count = await req.user.countExpenses({ where: { categoryId: catId } })

        if (count > 0) {
            // Dependency exists
            res.status(200).json({ success: false, msg: 'Dependency' });
        }
        else {
            req.user.getCategories({ where: { id: catId } })
                .then(categories => {
                    return categories[0].destroy();
                })
                .then(resp => {
                    res.status(200).json({ success: true, msg: 'Deleted Successfully' });
                })
                .catch(err => res.status(500).json({ success: false, msg: err }));
        }
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.postAddExpense = (req, res, next) => {
    try {
        req.user.createExpense({
            expenseDate: req.body.date,
            amount: req.body.amount,
            description: req.body.description,
            categoryId: req.body.categoryId
        })
            .then(expense => res.status(200).json({ expense: expense, success: true, msg: 'Expense Added Successfully' }))
            .catch(err => res.status(500).json({ success: false, msg: err }));

    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.getExpense = (req, res, next) => {
    try {
        // req.user.getExpenses({
        //     order: [['expenseDate', 'DESC']] 
        // })
        // Expense.findAll({
        //     where: { userId: req.user.id },
        //     include: {
        //         model: 'categories'
        //     }
        // })
        // Upgrade it after clearing doubt on sequelize
        const qry = `SELECT e.id, e.expenseDate, e.amount, e.description, e.categoryId, c.category
            FROM \`${process.env.DB_NAME}\`.expenses as e INNER JOIN \`${process.env.DB_NAME}\`.categories as c 
            ON e.categoryId=c.id WHERE e.userId=${req.user.id} ORDER BY e.expenseDate DESC, e.id DESC`;

        sequelize.query(qry)
            .then(expenses => res.status(200).json(expenses[0]))
            .catch(err => res.status(500).json({ success: false, msg: err }));
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.updateExpense = (req, res, next) => {
    try {
        const expId = req.params.expenseId;
        req.user.getExpenses({ where: { id: expId } })
            .then(expenses => {
                const expense = expenses[0];
                expense.expenseDate = req.body.date;
                expense.amount = req.body.amount;
                expense.description = req.body.description;
                expense.categoryId = req.body.categoryId;
                return expense.save();
            })
            .then(expense => {
                res.status(200).json({ success: true, msg: 'Updated Successfully' });
            })
            .catch(err => res.status(500).json({ success: false, msg: err }));
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.deleteExpense = async (req, res, next) => {
    try {
        const expId = req.params.expenseId;
        
        req.user.getExpenses({ where: { id: expId } })
            .then(expenses => {
                return expenses[0].destroy();
            })
            .then(resp => {
                res.status(200).json({ success: true, msg: 'Deleted Successfully' });
            })
            .catch(err => res.status(500).json({ success: false, msg: err }));
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.getLeaderboard = (req, res, next) => {
    try {
        if (req.user.isPremiumMember) {
            const qry = `SELECT u.id, u.name, IFNULL(SUM(e.amount),0) AS expAmount,
            DENSE_RANK() OVER (ORDER BY SUM(e.amount) DESC) AS 'rank'
            FROM \`${process.env.DB_NAME}\`.users as u
            LEFT JOIN \`${process.env.DB_NAME}\`.expenses as e ON e.userId=u.id
            GROUP BY u.id, u.name ORDER BY SUM(e.amount) DESC`;

            sequelize.query(qry)
                .then(LBdata => res.status(200).json({
                    LBdata: LBdata[0],
                    userId: req.user.id,
                    success: true,
                    isPremium: true
                }))
                .catch(err => res.status(500).json({ success: false, msg: err }));
        }
        else {
            res.status(200).json({ isPremium: false, success: false, msg: 'Not a Premium Member' });
        }
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.getExpDtlsCatWise = (req, res, next) => {
    try {
        if (req.user.isPremiumMember) {
            const userId = req.params.userId;
            const qry = `SELECT c.category, IFNULL(SUM(e.amount),0) AS expAmount 
            FROM \`${process.env.DB_NAME}\`.expenses as e
            INNER JOIN \`${process.env.DB_NAME}\`.categories as c ON c.id=e.categoryId
            WHERE e.userId=${userId} GROUP BY c.category ORDER BY SUM(e.amount) DESC`;

            sequelize.query(qry)
                .then(userExp => res.status(200).json({
                    userExp: userExp[0],
                    success: true,
                    isPremium: true
                }))
                .catch(err => res.status(500).json({ success: false, msg: err }));
        }
        else {
            res.status(200).json({ isPremium: false, success: false, msg: 'Not a Premium Member' });
        }
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}