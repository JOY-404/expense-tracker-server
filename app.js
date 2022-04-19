const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const sequelize = require('./util/database');
var cors = require('cors');
const PORT = process.env.PORT || 8000;

// Databases
const User = require('./models/user');
const Category = require('./models/category');
const Expense = require('./models/expense');
const Order = require('./models/order');

// Routes
const AuthenticationRoutes = require('./routes/AuthenticationRoutes');
const UserRoutes = require('./routes/UserRoutes');

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/auth', AuthenticationRoutes);
app.use('/user', UserRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Category);
Category.belongsTo(User);
Category.hasMany(Expense);
User.hasMany(Order);
Order.belongsTo(User);

sequelize
    //.sync({ force: true })
    .sync()
    .then(result => {
        app.listen(PORT);
    }).catch(err => console.log(err));