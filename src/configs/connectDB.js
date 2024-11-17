const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV;
const config = require('./config')[env];

const sequelize = new Sequelize({
    username: config.username,
    password: config.password,
    database: config.database,
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    timezone: config.timezone,
    pool: {
        max: 10, // Maximum number of connections in the pool
        min: 0, // Minimum number of connections in the pool
        acquire: 30000, // Maximum time in ms to acquire a connection
        idle: 10000, // Maximum time in ms a connection can be idle
    },
    retry: {
        max: 5, // Retry up to 5 times
        timeout: 3000, // Wait 3 seconds between retries
    },
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
    },
});

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('🚀 ~ connectDB ~ Connection has been successfully.');
    } catch (error) {
        console.error('🚀 ~ connectDB ~ Unable to connect to the database. Retrying...');
        console.error('🚀 ~ Error details:', error.message);
    }
};

module.exports = { connectDB, sequelize };
