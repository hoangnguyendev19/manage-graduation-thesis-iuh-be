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
        username: process.env.MYSQL_USERNAME,
        password: '123456',
        database: process.env.MYSQL_DATABASE_NAME,
        host: 'mysql',
        port: process.env.MYSQL_PORT,
        dialect: 'mysql',
        logging: false,
        timezone: '+07:00',
    },
};
