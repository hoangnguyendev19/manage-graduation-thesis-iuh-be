const redis = require('redis');
const logger = require('./logger.config');
const dotenv = require('dotenv');
dotenv.config();

const env = process.env.NODE_ENV;

const client = redis.createClient({
    password: env === 'local' ? undefined : process.env.CLOUD_REDIS_PASSWORD,
    username: env === 'local' ? undefined : process.env.CLOUD_REDIS_USERNAME,
    socket: {
        host: env === 'local' ? process.env.REDIS_HOST : process.env.CLOUD_REDIS_HOST,
        port: env === 'local' ? process.env.REDIS_PORT : process.env.CLOUD_REDIS_PORT,
    },
});

client.on('error', (error) => {
    logger.error(error);
});

client.on('connect', () => {
    logger.info('Connected to Redis successfully');
});

client.connect((error) => {
    if (error) {
        logger.error(error);
    }
});

module.exports = client;
