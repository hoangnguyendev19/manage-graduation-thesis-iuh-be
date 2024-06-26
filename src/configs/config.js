require('dotenv').config();
module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
        host: process.env.HOST,
        dialect: 'mysql',
        logging: false,
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
        timezone: '+07:00',
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
        host: process.env.HOST,
        dialect: 'mysql',
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
        host: process.env.HOST,
        dialect: 'mysql',
    },
};
