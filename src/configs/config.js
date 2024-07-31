require('dotenv').config();
module.exports = {
    local: {
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE_NAME,
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        dialect: 'mysql',
        logging: false,
        timezone: '+07:00',
    },
    development: {
        username: process.env.CLOUD_MYSQL_USERNAME,
        password: process.env.CLOUD_MYSQL_PASSWORD,
        database: process.env.CLOUD_MYSQL_DATABASE_NAME,
        host: process.env.CLOUD_MYSQL_HOST,
        port: process.env.CLOUD_MYSQL_PORT,
        dialect: 'mysql',
        logging: false,
        timezone: '+07:00',
    },
    production: {
        username: process.env.CLOUD_MYSQL_USERNAME,
        password: process.env.CLOUD_MYSQL_PASSWORD,
        database: process.env.CLOUD_MYSQL_DATABASE_NAME,
        host: process.env.CLOUD_MYSQL_HOST,
        port: process.env.CLOUD_MYSQL_PORT,
        dialect: 'mysql',
        logging: false,
        timezone: '+07:00',
    },
};
