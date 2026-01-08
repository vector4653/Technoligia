const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Load = sequelize.define('Load', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    params: { type: DataTypes.STRING }, // For extra flexibility if needed, but we used named fields below
    origin: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    cargoType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    maxPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 0 }
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'BIDDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'PAID'),
        defaultValue: 'OPEN',
    },
    winningBidAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    pickupOtp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    deliveryOtp: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

module.exports = Load;
