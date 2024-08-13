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
            message: 'Lấy danh sách thông báo thành công!',
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
            message: 'Lấy thông báo thành công!',
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
            message: 'Lấy danh sách thông báo thành công!',
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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

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

exports.updateReadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const notificationLecturer = await NotificationLecturer.findByPk(id);

        if (!notificationLecturer) {
            throw new Error.NotFoundError('Thông báo không tồn tại!');
        }

        await notificationLecturer.update({
            isRead: true,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật trạng thái đọc thành công!',
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
            throw new Error.NotFoundError('Thông báo không tồn tại!');
        }
        await notificationLecturer.destroy();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá thông báo thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
