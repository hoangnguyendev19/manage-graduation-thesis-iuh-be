const Error = require('../handler/errors');
const { Lecturer } = require('../schema/index');
const { verifyAccessToken } = require('../handler/jwt');

exports.protectLecturer = async (req, res, next) => {
    try {
        let token = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return Error.sendUnauthenticated(res);
        }

        const decoded = verifyAccessToken(token);
        const lecturer = await Lecturer.findByPk(decoded.id);

        if (!lecturer) {
            return Error.sendUnauthenticated(res);
        }
        req.user = lecturer;

        next();
    } catch (error) {
        return Error.sendUnauthenticated(res);
    }
};

exports.checkRoleLecturer = (roleName) => {
    // roleName: 'ADMIN' | 'LECTURER' | 'HEAD_LECTURER | 'SUB_HEAD_LECTURER'
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
