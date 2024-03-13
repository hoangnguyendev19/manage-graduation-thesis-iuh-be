const Error = require('../handler/errors');
const { Student } = require('../schema/index');
const { verifyAccessToken } = require('../handler/jwt');

exports.protectStudent = async (req, res, next) => {
    try {
        let token = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return Error.sendUnauthenticated(res);
        }

        const decoded = verifyAccessToken(token);
        const student = await Student.findByPk(decoded.id);
        if (!student) {
            return Error.sendUnauthenticated(res);
        }

        req.user = student;

        next();
    } catch (error) {
        return Error.sendUnauthenticated(res);
    }
};
