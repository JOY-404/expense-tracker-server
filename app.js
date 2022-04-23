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
const ForgotPasswordRequest = require('./models/forgotpasswordrequests');

// Routes
const AuthenticationRoutes = require('./routes/AuthenticationRoutes');
const UserRoutes = require('./routes/UserRoutes');
const PasswordRoutes = require('./routes/PasswordRoutes');

app.set('view engine', 'ejs');
app.set('views', 'views');
// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/auth', AuthenticationRoutes);
app.use('/user', UserRoutes);
app.use('/password', PasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Category);
Category.belongsTo(User);
Category.hasMany(Expense);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

sequelize
    //.sync({ force: true })
    .sync()
    .then(result => {
        app.listen(PORT);
    }).catch(err => console.log(err));