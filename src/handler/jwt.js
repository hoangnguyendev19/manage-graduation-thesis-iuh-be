const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.generateAccessToken = (id) => {
    const token = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
        expiresIn: process.env.ACCESS_TOKEN_LIFE,
    });
    return token;
};

exports.generateRefreshToken = (id) => {
    const token = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
        expiresIn: process.env.REFRESH_TOKEN_LIFE,
    });

    return token;
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
};
