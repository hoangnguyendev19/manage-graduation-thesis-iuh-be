const { NotificationStudent, StudentTerm } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');

exports.getMyNotification = async (req, res) => {
    try {
        const { user } = req;
        const notificationStudents = await NotificationStudent.findAll({
            where: { student_id: user.id },
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            notificationStudents,
        });
    } catch (error) {
        console.log('🚀 ~ exports.getMyNotification= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await NotificationStudent.findByPk(id);

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

exports.createAllNotificationStudentTerms = async (req, res) => {
    try {
        const { termId } = req.query;
        const { message } = req.body;
        const studentTerms = await StudentTerm.findAll({
            where: { term_id: termId },
        });

        const studentConvert = studentTerms.map((lt) => ({
            student_id: lt.student_id,
            message: message,
        }));
        await NotificationStudent.bulkCreate(studentConvert);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: `Gửi thông báo đến toàn bộ Sinh viên thành công.`,
        });
    } catch (error) {
        console.log('🚀 ~ exports.createAllNotificationStudentTerms= ~ error:', error);
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
