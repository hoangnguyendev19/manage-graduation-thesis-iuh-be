const Error = require('../helper/errors');
const { Lecturer } = require('../models/index');
const { verifyAccessToken } = require('../helper/jwt');

exports.protectLecturer = async (req, res, next) => {
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

        const lecturer = await Lecturer.findByPk(decoded.payload.id);
        if (!lecturer) {
            return Error.sendUnauthenticated(res);
        }
        req.user = lecturer;
        next();
    } catch (error) {
        return Error.sendError(res, error);
    }
};

exports.checkRoleLecturer = (roleName) => {
    // roleName: 'ADMIN' | 'LECTURER' | 'HEAD_LECTURER' | 'SUB_HEAD_LECTURER'
    return async (req, res, next) => {
        try {
            if (roleName === 'ADMIN' && req.user.isAdmin === true) {
                next();
                return;
            }
            if (req.user.role !== roleName) {
                return Error.sendWarning(res, 'You do not have permission to access this route');
            }
            next();
        } catch (error) {
            return Error.sendError(res, error);
        }
    };
};
