const { Role } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');

exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Roles retrieved successfully',
            roles,
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
            message: 'Roles retrieved successfully',
            roles,
        });
    } catch (error) {
        return Error.sendError(res, error);
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name, lecturerId } = req.body;
        const role = await Role.create({
            name,
            lecturer_id: lecturerId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Role created successfully',
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
            return Error.sendNotFound(res, 'Role không tồn tại!');
        }

        if (role.name === 'LECTURER') {
            return Error.sendWarning(res, 'Không thể xóa role LECTURER!');
        }

        await role.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Role deleted successfully',
        });
    } catch (error) {
        return Error.sendError(res, error);
    }
};
