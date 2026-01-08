const sequelize = require('../config/database');
const User = require('./User');
const Load = require('./Load');
const Bid = require('./Bid');

// Relationships

// Shipper posts Loads
User.hasMany(Load, { foreignKey: 'shipperId', as: 'postedLoads' });
Load.belongsTo(User, { foreignKey: 'shipperId', as: 'shipper' });

// Fleet/Driver assignments
User.hasMany(Load, { foreignKey: 'assignedToFleetId', as: 'fleetLoads' });
Load.belongsTo(User, { foreignKey: 'assignedToFleetId', as: 'assignedFleet' });

User.hasMany(Load, { foreignKey: 'assignedToDriverId', as: 'driverLoads' });
Load.belongsTo(User, { foreignKey: 'assignedToDriverId', as: 'assignedDriver' });

// Bids
Load.hasMany(Bid, { foreignKey: 'loadId', as: 'bids' });
Bid.belongsTo(Load, { foreignKey: 'loadId', as: 'load' });

User.hasMany(Bid, { foreignKey: 'fleetId', as: 'placedBids' });
Bid.belongsTo(User, { foreignKey: 'fleetId', as: 'bidder' });

module.exports = {
    sequelize,
    User,
    Load,
    Bid,
};
