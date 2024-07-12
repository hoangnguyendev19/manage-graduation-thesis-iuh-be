const Error = require('../helper/errors');
const { Lecturer, Role } = require('../models/index');
const { verifyAccessToken } = require('../helper/jwt');
const { Op } = require('sequelize');

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

exports.checkRole = (roles) => {
    // roleName: 'ADMIN' | 'LECTURER' | 'HEAD_LECTURER' | 'HEAD_COURSE'
    return async (req, res, next) => {
        try {
            const role = await Role.findOne({
                where: {
                    name: {
                        [Op.in]: roles,
                    },
                    lecturer_id: req.user.id,
                },
            });

            if (!role) {
                return Error.sendWarning(res, 'Bạn không có quyền truy cập vào tài nguyên này!');
            }

            next();
        } catch (error) {
            return Error.sendError(res, error);
        }
    };
};
