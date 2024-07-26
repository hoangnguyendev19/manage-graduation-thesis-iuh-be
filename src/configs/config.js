require('dotenv').config();
module.exports = {
    local: {
        mysql: {
            username: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE_NAME,
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            dialect: 'mysql',
            logging: false,
            timezone: '+07:00',
        },
        redis: {
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            database: process.env.REDIS_DATABASE_NAME,
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    },
    development: {
        mysql: {
            username: process.env.CLOUD_MYSQL_USERNAME,
            password: process.env.CLOUD_MYSQL_PASSWORD,
            database: process.env.CLOUD_MYSQL_DATABASE_NAME,
            host: process.env.CLOUD_MYSQL_HOST,
            port: process.env.CLOUD_MYSQL_PORT,
            dialect: 'mysql',
            logging: false,
            timezone: '+07:00',
        },
        redis: {
            username: process.env.CLOUD_REDIS_USERNAME,
            password: process.env.CLOUD_REDIS_PASSWORD,
            database: process.env.CLOUD_REDIS_DATABASE_NAME,
            host: process.env.CLOUD_REDIS_HOST,
            port: process.env.CLOUD_REDIS_PORT,
        },
    },
    production: {
        mysql: {
            username: process.env.CLOUD_MYSQL_USERNAME,
            password: process.env.CLOUD_MYSQL_PASSWORD,
            database: process.env.CLOUD_MYSQL_DATABASE_NAME,
            host: process.env.CLOUD_MYSQL_HOST,
            port: process.env.CLOUD_MYSQL_PORT,
            dialect: 'mysql',
            logging: false,
            timezone: '+07:00',
        },
        redis: {
            username: process.env.CLOUD_REDIS_USERNAME,
            password: process.env.CLOUD_REDIS_PASSWORD,
            database: process.env.CLOUD_REDIS_DATABASE_NAME,
            host: process.env.CLOUD_REDIS_HOST,
            port: process.env.CLOUD_REDIS_PORT,
        },
    },
};
