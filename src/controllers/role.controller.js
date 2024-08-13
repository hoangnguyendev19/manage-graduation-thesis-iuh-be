const { Role, Lecturer } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');

exports.getRoles = async (req, res) => {
    try {
        const roles = await sequelize.query(
            `SELECT l.id, l.username, l.full_name as fullName, m.name as majorName, r.name as roleName
            FROM lecturers l
            LEFT JOIN roles r ON r.lecturer_id = l.id
            LEFT JOIN majors m ON l.major_id = m.id`,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const newRoles = roles.reduce((acc, role) => {
            const { id, username, fullName, majorName, roleName } = role;
            if (!acc[id]) {
                acc[id] = {
                    id,
                    username,
                    fullName,
                    majorName,
                    roles: [],
                };
            }

            if (roleName) {
                acc[id].roles.push(roleName);
            }

            return acc;
        }, {});

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách vai trò thành công!',
            roles: Object.values(newRoles),
        });
    } catch (error) {
        return Error.sendError(res, error);
    }
};

exports.getRolesByLecturerId = async (req, res) => {
    try {
        const { id } = req.params;
        const roles = await Role.findAll({
            where: {
                lecturer_id: id,
            },
            attributes: ['id', 'name', 'created_at', 'updated_at'],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách vai trò thành công!',
            roles,
        });
    } catch (error) {
        return Error.sendError(res, error);
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name, lecturerId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const lecturerExist = await Lecturer.findByPk(lecturerId);

        if (!lecturerExist) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        const roleExist = await Role.findOne({
            where: {
                name,
                lecturer_id: lecturerExist.id,
            },
        });

        if (roleExist) {
            return Error.sendWarning(res, 'Vai trò đã tồn tại!');
        }

        const role = await Role.create({
            name,
            lecturer_id: lecturerId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo vai trò thành công!',
            role,
        });
    } catch (error) {
        return Error.sendError(res, error);
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);

        if (!role) {
            return Error.sendNotFound(res, 'Vai trò không tồn tại!');
        }

        if (role.name === 'LECTURER') {
            return Error.sendWarning(res, 'Không thể xóa vai trò Giảng viên!');
        }

        await role.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá vai trò thành công!',
        });
    } catch (error) {
        return Error.sendError(res, error);
    }
};
