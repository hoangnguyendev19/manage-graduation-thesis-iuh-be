const nodemailer = require('nodemailer');
const logger = require('./logger.config');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Replace with your SMTP server
    service: process.env.EMAIL_SERVICE,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

transporter.verify((error, success) => {
    if (error) {
        logger.error('Error while verifying the connection with the SMTP server ', error);
    } else {
        logger.info('Connected to the SMTP server successfully');
    }
});

module.exports = transporter;
