const {
    NotificationLecturer,
    NotificationStudent,
    Notification,
    StudentTerm,
    Student,
    Lecturer,
    GroupStudent,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');
const _ = require('lodash');

exports.getNotifications = async (req, res) => {
    try {
        const { limit, page, searchField, keywords } = req.query;
        let offset = (page - 1) * limit;

        const searchQuery = `WHERE n.${searchField} LIKE :keywords AND n.created_by = :lecturerId`;
        const searchKey = `%${keywords}%`;

        const notifications = await sequelize.query(
            `SELECT n.id, n.title, n.type, n.created_at as createdAt
            FROM notifications n
            ${searchQuery}
            ORDER BY n.created_at DESC
            LIMIT :limit OFFSET :offset`,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    keywords: searchKey,
                    lecturerId: req.user.id,
                    limit: _.toInteger(limit),
                    offset: _.toInteger(offset),
                },
            },
        );

        const countQuery = `WHERE n.${searchField} LIKE :keywords AND n.created_by = :lecturerId`;
        const count = await sequelize.query(
            `SELECT COUNT(*) as total
            FROM notifications n
            ${countQuery}`,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    keywords: searchKey,
                    lecturerId: req.user.id,
                },
            },
        );
        const total = count[0].total;
        const totalPage = _.ceil(total / _.toInteger(limit));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách thông báo thành công!',
            notifications,
            params: {
                page: _.toInteger(page),
                limit: _.toInteger(limit),
                totalPage,
            },
        });
    } catch (error) {
        console.log('🚀 ~ exports.getNotifications= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await sequelize.query(
            `SELECT n.id, n.created_at as createdAt, n.title, n.content, n.type
            FROM notifications n
            WHERE n.id = :id`,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    id,
                },
            },
        );

        let details = [];

        if (notification[0].type === 'STUDENT') {
            const notificationStudents = await NotificationStudent.findAll({
                where: { notification_id: id },
            });

            details = await Promise.all(
                notificationStudents.map(async (item) => {
                    const student = await Student.findOne({
                        where: { id: item.student_id },
                        attributes: ['username', 'full_name'],
                    });

                    return student;
                }),
            );
        } else if (notification[0].type === 'LECTURER') {
            const notificationLecturers = await NotificationLecturer.findAll({
                where: { notification_id: id },
            });

            details = await Promise.all(
                notificationLecturers.map(async (item) => {
                    const lecturer = await Lecturer.findOne({
                        where: { id: item.lecturer_id },
                        attributes: ['username', 'full_name'],
                    });

                    return lecturer;
                }),
            );
        } else if (notification[0].type === 'GROUP_STUDENT') {
            const notificationStudents = await NotificationStudent.findAll({
                where: { notification_id: id },
            });

            details = await Promise.all(
                notificationStudents.map(async (item) => {
                    const studentTerm = await StudentTerm.findOne({
                        where: { student_id: item.student_id },
                        attributes: ['group_student_id'],
                    });

                    const groupStudent = await sequelize.query(
                        `SELECT gs.id, gs.name, t.name as topicName
                        FROM group_students gs
                        JOIN topics t ON t.id = gs.topic_id
                        WHERE gs.id = :groupStudentId`,
                        {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                groupStudentId: studentTerm.group_student_id,
                            },
                        },
                    );

                    return { ...groupStudent[0] };
                }),
            );

            details = details.reduce((acc, item) => {
                const group = acc.find((group) => group.id === item.id);

                if (!group) {
                    acc.push({ id: item.id, name: item.name, topicName: item.topicName });
                }

                return acc;
            }, []);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông báo thành công!',
            notification: notification[0],
            details,
        });
    } catch (error) {
        console.log('🚀 ~ exports.getNotifications= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return Error.sendNotFound(res, 'Thông báo không tồn tại!');
        }

        // check if notification is created by current user
        if (notification.created_by !== req.user.id) {
            return Error.sendForbidden(res, 'Bạn không có quyền cập nhật thông báo này!');
        }

        await notification.update({
            title,
            content,
        });

        const notificationLecturers = await NotificationLecturer.findAll({
            where: { notification_id: id },
        });

        notificationLecturers.forEach(async (item) => {
            await item.update({
                isRead: false,
            });
        });

        const notificationStudents = await NotificationStudent.findAll({
            where: { notification_id: id },
        });

        notificationStudents.forEach(async (item) => {
            await item.update({
                isRead: false,
            });
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thông báo thành công!',
        });
    } catch (error) {
        console.log('🚀 ~ exports.updateNotification= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return Error.sendNotFound(res, 'Thông báo không tồn tại!');
        }

        // check if notification is created by current user
        if (notification.created_by !== req.user.id) {
            return Error.sendForbidden(res, 'Bạn không có quyền xóa thông báo này!');
        }

        // delete all notification lecturer
        await NotificationLecturer.destroy({
            where: { notification_id: id },
        });

        // delete all notification student
        await NotificationStudent.destroy({
            where: { notification_id: id },
        });

        await notification.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xóa thông báo thành công!',
        });
    } catch (error) {
        console.log('🚀 ~ exports.deleteNotification= ~ error:', error);
        Error.sendError(res, error);
    }
};
