const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = 'development';
const config = require('./config')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: 3306,
    dialect: config.dialect,
    logging: config.logging,
    timezone: '+07:00',
});

// (async () => await sequelize.sync({ alter: true }))();
(async () => await sequelize.sync({}))();

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('🚀 ~ connectDB ~  Connection has been successfully.');
    } catch (error) {
        console.error('🚀 ~ connectDB ~  Unable to connect to the database:', error);
    }
};

module.exports = { connectDB, sequelize };
