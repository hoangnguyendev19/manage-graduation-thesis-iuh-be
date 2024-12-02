const {
    Term,
    GroupStudent,
    LecturerTerm,
    EventGroupStudent,
    Notification,
    StudentTerm,
    Event,
    NotificationStudent,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');
const fs = require('fs');

exports.getEvents = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const events = await sequelize.query(
            `SELECT e.id, e.name, e.start_date as startDate, e.end_date as endDate
            FROM events e
            INNER JOIN lecturer_terms lt ON e.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId`,
            {
                replacements: { termId, lecturerId: req.user.id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách sự kiện thành công!',
            events,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        let event = await sequelize.query(
            `SELECT e.id, e.name, e.start_date as startDate, e.end_date as endDate, gs.id as groupStudentId, gs.name as groupStudentName, t.name as topicName, eg.link, eg.comment
            FROM events e
            INNER JOIN event_group_students eg ON e.id = eg.event_id
            INNER JOIN group_students gs ON eg.group_student_id = gs.id
            INNER JOIN topics t ON gs.topic_id = t.id
            WHERE e.id = :id`,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (event.length === 0) {
            return Error.sendNotFound(res, 'Sự kiện không tồn tại!');
        }

        event = event.reduce(
            (acc, cur) => {
                acc.id = cur.id;
                acc.name = cur.name;
                acc.startDate = cur.startDate;
                acc.endDate = cur.endDate;
                acc.groupStudents.push({
                    id: cur.groupStudentId,
                    name: cur.groupStudentName,
                    topicName: cur.topicName,
                    link: cur.link,
                    comment: cur.comment,
                });
                return acc;
            },
            { groupStudents: [] },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin sự kiện thành công!',
            event,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getEventsByGroupStudentId = async (req, res) => {
    try {
        const { id } = req.params;

        const events = await sequelize.query(
            `SELECT e.id, e.name, e.start_date as startDate, e.end_date as endDate, eg.link, eg.comment
            FROM events e
            INNER JOIN event_group_students eg ON e.id = eg.event_id
            WHERE eg.group_student_id = :id`,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách sự kiện thành công!',
            events,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { name, startDate, endDate, groupStudentIds, termId } = req.body;

        // check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const lecturerTerm = await LecturerTerm.findOne({
            where: { term_id: termId, lecturer_id: req.user.id },
        });

        if (!lecturerTerm) {
            return Error.sendForbidden(res, 'Bạn không phải giảng viên của học kỳ này!');
        }

        const event = await Event.create({
            name,
            startDate,
            endDate,
            lecturer_term_id: lecturerTerm.id,
        });

        const notification = await Notification.create({
            title: name,
            content: `Giảng viên hướng dẫn đã tạo sự kiện ${name} cho nhóm sinh viên. Thời hạn nộp bài: từ ${startDate} đến ${endDate}.`,
            type: 'STUDENT',
            created_by: req.user.id,
        });

        if (groupStudentIds.length !== 0) {
            await Promise.all(
                groupStudentIds.map(async (groupStudentId) => {
                    await EventGroupStudent.create({
                        event_id: event.id,
                        group_student_id: groupStudentId,
                    });

                    const studentIds = await StudentTerm.findAll({
                        attributes: ['student_id'],
                        where: { group_student_id: groupStudentId },
                    });

                    await Promise.all(
                        studentIds.map(async (studentId) => {
                            await NotificationStudent.create({
                                notification_id: notification.id,
                                student_id: studentId.student_id,
                            });
                        }),
                    );
                }),
            );
        } else {
            const groupStudents = await sequelize.query(
                `SELECT gs.id
                FROM group_students gs
                INNER JOIN topics t ON gs.topic_id = t.id
                WHERE t.lecturer_term_id = :lecturerTermId`,
                {
                    replacements: { lecturerTermId: lecturerTerm.id },
                    type: sequelize.QueryTypes.SELECT,
                },
            );

            await Promise.all(
                groupStudents.map(async (groupStudent) => {
                    await EventGroupStudent.create({
                        event_id: event.id,
                        group_student_id: groupStudent.id,
                    });

                    const studentIds = await StudentTerm.findAll({
                        attributes: ['student_id'],
                        where: { group_student_id: groupStudent.id },
                    });

                    await Promise.all(
                        studentIds.map(async (studentId) => {
                            await NotificationStudent.create({
                                notification_id: notification.id,
                                student_id: studentId.student_id,
                            });
                        }),
                    );
                }),
            );
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo sự kiện thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startDate, endDate } = req.body;

        const event = await Event.findByPk(id);

        if (!event) {
            return Error.sendNotFound(res, 'Sự kiện không tồn tại!');
        }

        await event.update({ name, startDate, endDate });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật sự kiện thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByPk(id);

        if (!event) {
            return Error.sendNotFound(res, 'Sự kiện không tồn tại!');
        }

        await EventGroupStudent.destroy({
            where: { event_id: id },
        });

        await event.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xóa sự kiện thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.submitEvent = async (req, res) => {
    // Ensure the file is properly uploaded
    if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No file uploaded.',
        });
    }

    try {
        const { id } = req.params;
        const { groupStudentId } = req.body;

        const fileName = req.file.filename;
        const filePath = `/temp/${fileName}`; // Relative path to `public` folder

        const event = await Event.findByPk(id);
        if (!event) {
            return Error.sendNotFound(res, 'Sự kiện không tồn tại!');
        }

        const groupStudent = await GroupStudent.findByPk(groupStudentId);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        const eventGroupStudent = await EventGroupStudent.findOne({
            where: { event_id: id, group_student_id: groupStudentId },
        });

        if (!eventGroupStudent) {
            return Error.sendNotFound(res, 'Sự kiện không tồn tại!');
        }

        if (eventGroupStudent.link) {
            // Delete the old file
            const oldFilePath = eventGroupStudent.link;
            fs.unlinkSync(`public${oldFilePath}`); // Delete the file
        }

        await eventGroupStudent.update({ link: filePath });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Nộp sự kiện thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.commentEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, groupStudentId } = req.body;

        const event = await Event.findByPk(id);
        if (!event) {
            return Error.sendNotFound(res, 'Sự kiện không tồn tại!');
        }

        const groupStudent = await GroupStudent.findByPk(groupStudentId);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        const eventGroupStudent = await EventGroupStudent.findOne({
            where: { event_id: id, group_student_id: groupStudentId },
        });

        if (!eventGroupStudent) {
            return Error.sendNotFound(res, 'Sự kiện không tồn tại!');
        }

        await eventGroupStudent.update({ comment });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Nhận xét sự kiện thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
