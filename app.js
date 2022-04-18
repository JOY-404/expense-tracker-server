const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const sequelize = require('./util/database');
const cors = require('cors');
const PORT = process.env.PORT || 8000;

// Databases
const User = require('./models/user');

// Routes
const AuthenticationRoutes = require('./routes/AuthenticationRoutes');

// Middlewares
app.use(cors());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/auth', AuthenticationRoutes);

// Just for checking - remove it later
app.use((req, res, next) => {
    res.status(200).json({msg: 'running'});
})

sequelize
    //.sync({ force: true })
    .sync()
    .then(result => {
        app.listen(PORT);
    }).catch(err => console.log(err));