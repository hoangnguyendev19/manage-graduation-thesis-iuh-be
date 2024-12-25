const Error = require('../helper/errors');
const { Student } = require('../models/index');
const { verifyAccessToken } = require('../helper/jwt');
const logger = require('../configs/logger.config');

exports.protectStudent = async (req, res, next) => {
    try {
        let token = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return Error.sendUnauthenticated(res);
        }

        const decoded = await verifyAccessToken(token);

        if (decoded.expired) {
            return Error.sendUnauthenticated(res);
        }

        const student = await Student.findByPk(decoded.payload.id);
        if (!student) {
            return Error.sendUnauthenticated(res);
        }

        req.user = student;
        next();
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};
