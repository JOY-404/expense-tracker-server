const { Sequelize } = require('sequelize');
const sequelize = require('../util/database');

const Category = sequelize.define('category', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Category;