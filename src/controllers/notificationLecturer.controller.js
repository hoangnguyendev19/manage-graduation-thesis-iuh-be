const { NotificationLecturer, LecturerTerm, Notification, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { validationResult } = require('express-validator');
const { sequelize } = require('../configs/mysql.config');
const _ = require('lodash');
const logger = require('../configs/logger.config');

exports.getMyNotification = async (req, res) => {
    try {
        const { limit } = req.query;

        const notifications = await sequelize.query(
            `SELECT nl.id, nl.is_read as isRead, n.created_at as createdAt, n.title
            FROM notification_lecturers nl
            INNER JOIN notifications n ON nl.notification_id = n.id
            WHERE nl.lecturer_id = :lecturerId
            ORDER BY n.created_at DESC
            LIMIT :limit`,
            {
                replacements: {
                    lecturerId: req.user.id,
                    limit: _.toInteger(limit),
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách thông báo thành công!',
            notifications,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await sequelize.query(
            `SELECT nl.id, nl.is_read as isRead, n.created_at as createdAt, n.title, n.content, n.type, l.full_name as senderName
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
            notification: notification[0],
        });
    } catch (error) {
        logger.error(error);
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

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Không tìm thấy kỳ học này!');
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
            type: 'LECTURER',
            created_by: req.user.id,
        });

        const lecturerConvert = lecturerTerms.map((lt) => {
            if (lt.lecturer_id !== req.user.id) {
                return {
                    lecturer_id: lt.lecturer_id,
                    notification_id: notification.id,
                };
            }
        });

        await NotificationLecturer.bulkCreate(lecturerConvert);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: `Gửi thông báo đến toàn bộ giảng viên hướng dẫn thành công.`,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.createNotificationLecturer = async (req, res) => {
    try {
        const { title, content, lecturerIds } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const notification = await Notification.create({
            title,
            content,
            type: 'LECTURER',
            created_by: req.user.id,
        });

        const lecturerConvert = lecturerIds.map((lt) => ({
            lecturer_id: lt,
            notification_id: notification.id,
        }));

        await NotificationLecturer.bulkCreate(lecturerConvert);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Gửi thông báo thành công.',
        });
    } catch (error) {
        logger.error(error);
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
        logger.error(error);
        Error.sendError(res, error);
    }
};
