const { NotificationStudent, StudentTerm, Notification } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { validationResult } = require('express-validator');
const { sequelize } = require('../configs/connectDB');

exports.getMyNotification = async (req, res) => {
    try {
        const notifications = await sequelize.query(
            `SELECT ns.id, ns.is_read as isRead, n.created_at as createdAt, n.title
            FROM notification_students ns
            INNER JOIN notifications n ON ns.notification_id = n.id
            WHERE ns.student_id = :studentId
            ORDER BY n.created_at DESC`,
            {
                replacements: { studentId: req.user.id },
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
            `SELECT ns.id, ns.is_read as isRead, n.created_at as createdAt, n.title, n.content, l.full_name as createdBy
            FROM notification_students ns
            INNER JOIN notifications n ON ns.notification_id = n.id
            INNER JOIN lecturers l ON n.created_by = l.id
            WHERE ns.id = :id`,
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

exports.createAllNotificationStudentTerms = async (req, res) => {
    try {
        const { title, content, termId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const studentTerms = await StudentTerm.findAll({
            where: { term_id: termId },
        });

        if (studentTerms.length === 0) {
            return Error.sendNotFound(res, 'Không tìm thấy sinh viên nào trong kỳ học này!');
        }

        const notification = await Notification.create({
            title,
            content,
            created_by: req.user.id,
        });

        const studentConvert = studentTerms.map((lt) => ({
            student_id: lt.student_id,
            notification_id: notification.id,
        }));

        await NotificationStudent.bulkCreate(studentConvert);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: `Gửi thông báo đến toàn bộ sinh viên thành công.`,
        });
    } catch (error) {
        console.log('🚀 ~ exports.createAllNotificationStudentTerms= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.createNotificationStudent = async (req, res) => {
    try {
        const { title, content, studentId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const studentTerm = await StudentTerm.findOne({
            where: { student_id: studentId },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        const notification = await Notification.create({
            title,
            content,
            created_by: req.user.id,
        });

        await NotificationStudent.create({
            student_id: studentId,
            notification_id: notification.id,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo thông báo thành công.',
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
            return Error.sendNotFound(res, 'Thông báo không tồn tại!');
        }

        await notificationStudent.update({
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
