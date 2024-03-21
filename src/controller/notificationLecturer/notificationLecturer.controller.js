const { NotificationLecturer } = require('../../schema/index');
const Error = require('../../helper/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');

exports.getNotificationLecturers = async (req, res) => {
    try {
        const notificationLecturers = await NotificationLecturer.findAll({
            where: {
                lecturer_id: req.user.id,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            notificationLecturers,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createNotificationLecturer = async (req, res) => {
    try {
        const { message, type, lecturerId } = req.body;
        const notificationLecturer = await NotificationLecturer.create({
            message,
            type,
            lecturer_id: lecturerId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            notificationLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateNotificationLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, type, lecturerId } = req.body;
        const notificationLecturer = await NotificationLecturer.findByPk(id);

        if (!notificationLecturer) {
            throw new Error.NotFoundError('NotificationLecturer not found');
        }

        await notificationLecturer.update({
            message,
            type,
            Lecturer_id: lecturerId,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            notificationLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateReadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const notificationLecturer = await NotificationLecturer.findByPk(id);

        if (!notificationLecturer) {
            throw new Error.NotFoundError('NotificationLecturer not found');
        }

        await notificationLecturer.update({
            is_read: true,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            notificationLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteNotificationLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const notificationLecturer = await NotificationLecturer.findByPk(id);

        if (!notificationLecturer) {
            throw new Error.NotFoundError('NotificationLecturer not found');
        }

        await notificationLecturer.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
