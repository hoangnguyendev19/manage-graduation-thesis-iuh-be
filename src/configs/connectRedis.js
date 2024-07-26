const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const env = 'local'; // development, production
const config = require('./config')[env]['redis'];

const client = redis.createClient({
    password: env === 'local' ? undefined : config.password,
    username: env === 'local' ? undefined : config.username,
    socket: {
        host: config.host,
        port: config.port,
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
