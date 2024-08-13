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
            message: 'Lấy danh sách thông báo thành công!',
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
            message: 'Lấy thông báo thành công!',
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
            message: 'Lấy danh sách thông báo thành công!',
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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const notificationStudent = await NotificationStudent.create({
            message,
            student_id: studentId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo thông báo thành công.',
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
            message: 'Cập nhật trạng thái đọc thành công!',
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
            message: 'Xoá thông báo thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
