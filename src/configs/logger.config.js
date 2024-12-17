const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
    level: 'info', // Set log level (e.g., 'info', 'debug', 'error')
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`),
    ),
    transports: [
        new transports.Console(), // Log to the console
        new transports.File({ filename: path.join('public', 'logs', 'application.log') }), // Save logs to a file
    ],
});

module.exports = logger;
