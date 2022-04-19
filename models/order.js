const { Sequelize } = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    description: Sequelize.STRING,
    gtwyOrderId: Sequelize.STRING, 
    gtwyPmtId: Sequelize.STRING,
    gtwySignature: Sequelize.STRING,
    pmtStatus: Sequelize.STRING
});

module.exports = Order;