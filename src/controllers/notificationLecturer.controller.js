const { NotificationLecturer, LecturerTerm, Notification } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { validationResult } = require('express-validator');
const { sequelize } = require('../configs/connectDB');

exports.getMyNotification = async (req, res) => {
    try {
        const notifications = await sequelize.query(
            `SELECT nl.id, nl.is_read as isRead, n.created_at as createdAt, n.title
            FROM notification_lecturers nl
            INNER JOIN notifications n ON nl.notification_id = n.id
            WHERE nl.lecturer_id = :lecturerId
            ORDER BY n.created_at DESC`,
            {
                replacements: { lecturerId: req.user.id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách thông báo thành công!',
            notifications,
        });
    } catch (error) {
        console.log('🚀 ~ exports.getMyNotification= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await sequelize.query(
            `SELECT nl.id, nl.is_read as isRead, n.created_at as createdAt, n.title, n.content, l.full_name as createdBy
            FROM notification_lecturers nl
            INNER JOIN notifications n ON nl.notification_id = n.id
            INNER JOIN lecturers l ON n.created_by = l.id
            WHERE nl.id = :id`,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

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

exports.createAllNotificationLecturerTerms = async (req, res) => {
    try {
        const { title, content, termId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const lecturerTerms = await LecturerTerm.findAll({
            where: { term_id: termId },
        });

        if (lecturerTerms.length === 0) {
            return Error.sendNotFound(res, 'Không tìm thấy Giảng viên Hướng dẫn nào trong kỳ này.');
        }

        const notification = await Notification.create({
            title,
            content,
            created_by: req.user.id,
        });

        const lecturerConvert = lecturerTerms.map((lt) => ({
            lecturer_id: lt.lecturer_id,
            notification_id: notification.id,
        }));

        await NotificationLecturer.bulkCreate(lecturerConvert);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: `Gửi thông báo đến toàn bộ giảng viên hướng dẫn thành công.`,
        });
    } catch (error) {
        console.log('🚀 ~ exports.createAllNotificationLecturerTerms= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.createNotificationLecturer = async (req, res) => {
    try {
        const { title, content, lecturerId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const lecturerTerm = await LecturerTerm.findOne({
            where: { lecturer_id: lecturerId },
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong kỳ học!');
        }

        const notification = await Notification.create({
            title,
            content,
            created_by: req.user.id,
        });

        await NotificationLecturer.create({
            lecturer_id: lecturerId,
            notification_id: notification.id,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Gửi thông báo thành công.',
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
            return Error.sendNotFound(res, 'Thông báo không tồn tại!');
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
