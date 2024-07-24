const { NotificationLecturer, LecturerTerm } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');

exports.getMyNotification = async (req, res) => {
    try {
        const { user } = req;
        const notificationLecturers = await NotificationLecturer.findAll({
            where: { lecturer_id: user.id },
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            notificationLecturers,
        });
    } catch (error) {
        console.log('🚀 ~ exports.getMyNotification= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await NotificationLecturer.findByPk(id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get by id success',
            notification,
        });
    } catch (error) {
        console.log('🚀 ~ exports.getNotificationById= ~ error:', error);
        Error.sendError(res, error);
    }
};

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

exports.createAllNotificationLecturerTerms = async (req, res) => {
    try {
        const { termId } = req.query;
        const { message } = req.body;
        const lecturerTerms = await LecturerTerm.findAll({
            where: { term_id: termId },
        });

        const lecturerConvert = lecturerTerms.map((lt) => ({
            lecturer_id: lt.lecturer_id,
            message: message,
        }));
        await NotificationLecturer.bulkCreate(lecturerConvert);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: `Gửi thông báo đến toàn bộ Giảng viên Hướng dẫn thành công.`,
        });
    } catch (error) {
        console.log('🚀 ~ exports.createAllNotificationLecturerTerms= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.createNotificationLecturer = async (req, res) => {
    try {
        const { message, lecturerId } = req.body;
        const notificationLecturer = await NotificationLecturer.create({
            message,
            lecturer_id: lecturerId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Gửi thông báo thành công.',
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
        const { message, lecturerId } = req.body;
        const notificationLecturer = await NotificationLecturer.findByPk(id);

        if (!notificationLecturer) {
            throw new Error.NotFoundError('NotificationLecturer not found');
        }

        await notificationLecturer.update({
            message,
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
            isRead: true,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update read status Success',
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
