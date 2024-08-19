const { NotificationStudent, StudentTerm, Notification, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { validationResult } = require('express-validator');
const { sequelize } = require('../configs/connectDB');
const _ = require('lodash');

exports.getMyNotification = async (req, res) => {
    try {
        const { limit } = req.query;

        const notifications = await sequelize.query(
            `SELECT ns.id, ns.is_read as isRead, n.created_at as createdAt, n.title
            FROM notification_students ns
            INNER JOIN notifications n ON ns.notification_id = n.id
            WHERE ns.student_id = :studentId
            ORDER BY n.created_at DESC
            LIMIT :limit`,
            {
                replacements: {
                    studentId: req.user.id,
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
        console.log('🚀 ~ exports.getMyNotification= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await sequelize.query(
            `SELECT ns.id, ns.is_read as isRead, n.created_at as createdAt, n.title, n.content, n.type, l.full_name as senderName
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
            notification: notification[0],
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

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Không tìm thấy kỳ học này!');
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
        const { title, content, studentIds } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const notification = await Notification.create({
            title,
            content,
            type: 'STUDENT',
            created_by: req.user.id,
        });

        const studentConvert = studentIds.map((lt) => ({
            student_id: lt,
            notification_id: notification.id,
        }));

        await NotificationStudent.bulkCreate(studentConvert);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Gửi thông báo thành công.',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createNotificationGroupStudent = async (req, res) => {
    try {
        const { title, content, groupStudentIds } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const notification = await Notification.create({
            title,
            content,
            type: 'GROUP_STUDENT',
            created_by: req.user.id,
        });

        for (const groupStudentId of groupStudentIds) {
            const studentTermIds = await StudentTerm.findAll({
                where: { group_student_id: groupStudentId },
                attributes: ['student_id'],
            });

            for (const studentTermId of studentTermIds) {
                await NotificationStudent.create({
                    student_id: studentTermId.student_id,
                    notification_id: notification.id,
                });
            }
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: `Gửi thông báo đến toàn bộ sinh viên trong nhóm thành công.`,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createAllNotificationGroupStudentOfMyInstructor = async (req, res) => {
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

        const studentIds = await sequelize.query(
            `SELECT st.student_id
            FROM lecturer_terms lt
            INNER JOIN topics t ON lt.id = t.lecturer_term_id
            INNER JOIN group_students gs ON t.id = gs.topic_id
            INNER JOIN student_terms st ON gs.id = st.group_student_id
            WHERE lt.lecturer_id = :lecturerId AND lt.term_id = :termId`,
            {
                replacements: {
                    lecturerId: req.user.id,
                    termId,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (studentIds.length === 0) {
            return Error.sendNotFound(res, 'Không tìm thấy sinh viên nào trong kỳ học này!');
        }

        const notification = await Notification.create({
            title,
            content,
            type: 'GROUP_STUDENT',
            created_by: req.user.id,
        });

        for (const studentId of studentIds) {
            await NotificationStudent.create({
                student_id: studentId.student_id,
                notification_id: notification.id,
            });
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: `Gửi thông báo đến toàn bộ nhóm sinh viên của giảng viên thành công.`,
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
