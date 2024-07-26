const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = 'local'; // development, production
const config = require('./config')[env]['mysql'];

const sequelize = new Sequelize({
    username: config.username,
    password: config.password,
    database: config.database,
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    timezone: config.timezone,
});

// (async () => await sequelize.sync({ alter: true }))();
// (async () => await sequelize.sync({}))();

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('🚀 ~ connectDB ~  Connection has been successfully.');
    } catch (error) {
        console.error('🚀 ~ connectDB ~  Unable to connect to the database:', error);
    }
};

module.exports = { connectDB, sequelize };
