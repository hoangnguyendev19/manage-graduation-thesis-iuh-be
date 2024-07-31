const redis = require('redis');
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
    console.error(error);
});

client.on('connect', () => {
    console.log('🚀> Redis connected');
});

client.connect((error) => {
    if (error) {
        console.error(error);
    }
});

module.exports = client;
