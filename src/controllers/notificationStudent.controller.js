const { NotificationStudent } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Op } = require('sequelize');

exports.getNotificationStudents = async (req, res) => {
    try {
        const notificationStudents = await NotificationStudent.findAll({
            where: {
                student_id: req.user.id,
            },
            attributes: {
                exclude: ['student_id'],
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            notifications: notificationStudents,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createNotificationStudent = async (req, res) => {
    try {
        const { message, studentId } = req.body;
        const notificationStudent = await NotificationStudent.create({
            message,
            student_id: studentId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            notificationStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateNotificationStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, studentId } = req.body;
        const notificationStudent = await NotificationStudent.findByPk(id);

        if (!notificationStudent) {
            throw new Error.NotFoundError('NotificationStudent not found');
        }

        await notificationStudent.update({
            message,
            student_id: studentId,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            notificationStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateReadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const notificationStudent = await NotificationStudent.findByPk(id);

        if (!notificationStudent) {
            throw new Error.NotFoundError('NotificationStudent not found');
        }

        await notificationStudent.update({
            isRead: true,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            notificationStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteNotificationStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const notificationStudent = await NotificationStudent.findByPk(id);

        if (!notificationStudent) {
            throw new Error.NotFoundError('NotificationStudent not found');
        }

        await notificationStudent.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
