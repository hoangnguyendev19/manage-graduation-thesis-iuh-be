const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const client = require('../configs/connectRedis');
const Error = require('./errors');

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

    client.set(id.toString(), token, 'EX', 24 * 3600, (error, reply) => {
        if (error) {
            return Error.sendError(res, error);
        }
    });

    return token;
};

exports.verifyAccessToken = async (token) => {
    try {
        return { payload: jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY), expired: false };
    } catch (error) {
        if (error.name == 'TokenExpiredError') {
            return { payload: jwt.decode(token), expired: true };
        }
        throw error;
    }
};

exports.verifyRefreshToken = (token) => {
    const data = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);

    client.get(data.id.toString(), (error, result) => {
        if (error) {
            return Error.sendError(res, error);
        }
        if (result !== token) {
            return Error.sendUnauthenticated(res);
        }
    });

    return data;
};

exports.removeRefreshToken = (id) => {
    client.del(id.toString(), (error, reply) => {
        if (error) {
            return Error.sendError(res, error);
        }

        if (reply !== 1) {
            return Error.sendError(res, 'Token not deleted');
        }

        return reply;
    });
};
