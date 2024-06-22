const { GroupStudent, StudentTerm, Student, Topic } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const _ = require('lodash');

exports.getGroupStudents = async (req, res) => {
    try {
        const { termId, topicId, majorId, page, limit } = req.query;
        let offset = (page - 1) * limit;

        let groupStudents = [];
        let total = 0;

        if (majorId && !topicId) {
            groupStudents = await sequelize.query(
                `SELECT gs.id, gs.name, gs.topic_id as topicId, tc.name as topicName, COUNT(st.student_id) as numOfMembers FROM group_students gs 
                LEFT JOIN student_terms st ON gs.id = st.group_student_id 
                LEFT JOIN topics tc ON gs.topic_id = tc.id 
                WHERE gs.term_id = :termId and st.student_id IN (SELECT id FROM students WHERE major_id = :majorId)
                GROUP BY gs.id
                ORDER BY gs.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { termId, majorId, limit: parseInt(limit), offset },
                },
            );

            total = await sequelize.query(
                `SELECT COUNT(DISTINCT gs.id) as total FROM group_students gs 
                LEFT JOIN student_terms st ON gs.id = st.group_student_id 
                WHERE gs.term_id = :termId and st.student_id IN (SELECT id FROM students WHERE major_id = :majorId)`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { termId, majorId },
                },
            );

            total = total[0].total;
        } else if (majorId && topicId) {
            groupStudents = await sequelize.query(
                `SELECT gs.id, gs.name, gs.topic_id as topicId, tc.name as topicName, COUNT(st.student_id) as numOfMembers FROM group_students gs 
                LEFT JOIN student_terms st ON gs.id = st.group_student_id 
                LEFT JOIN topics tc ON gs.topic_id = tc.id 
                WHERE gs.term_id = :termId and gs.topic_id = :topicId and st.student_id IN (SELECT id FROM students WHERE major_id = :majorId)
                GROUP BY gs.id
                ORDER BY gs.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { termId, topicId, majorId, limit: parseInt(limit), offset },
                },
            );

            total = await sequelize.query(
                `SELECT COUNT(DISTINCT gs.id) as total FROM group_students gs 
                LEFT JOIN student_terms st ON gs.id = st.group_student_id 
                WHERE gs.term_id = :termId and gs.topic_id = :topicId and st.student_id IN (SELECT id FROM students WHERE major_id = :majorId)`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { termId, topicId, majorId },
                },
            );

            total = total[0].total;
        } else if (!majorId && !topicId) {
            groupStudents = await sequelize.query(
                `SELECT gs.id, gs.name, gs.topic_id as topicId, tc.name as topicName, COUNT(st.student_id) as numOfMembers FROM group_students gs 
                LEFT JOIN student_terms st ON gs.id = st.group_student_id 
                LEFT JOIN topics tc ON gs.topic_id = tc.id 
                WHERE gs.term_id = :termId
                GROUP BY gs.id
                ORDER BY gs.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { termId, limit: parseInt(limit), offset },
                },
            );

            total = await sequelize.query(
                `SELECT COUNT(DISTINCT gs.id) as total FROM group_students gs 
                LEFT JOIN student_terms st ON gs.id = st.group_student_id 
                WHERE gs.term_id = :termId`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { termId },
                },
            );

            total = total[0].total;
        }

        const totalPage = _.ceil(total / _.toInteger(limit));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get all success!',
            groupStudents,
            params: {
                page: _.toInteger(page),
                limit: _.toInteger(limit),
                totalPage,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentsByLecturer = async (req, res) => {
    try {
        const { termId } = req.query;

        const groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, tc.name, COUNT(st.student_id) as numOfMembers FROM group_students gs
            LEFT JOIN topics tc ON gs.topic_id = tc.id
            LEFT JOIN lecturer_terms lt ON tc.lecturer_term_id = lt.id
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            WHERE gs.term_id = :termId and lt.lecturer_id = :lecturerId
            GROUP BY gs.id`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId, lecturerId: req.user.id },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get all success!',
            groupStudents,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentsByMajor = async (req, res) => {
    try {
        const { termId, majorId } = req.query;

        const groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, COUNT(st.student_id) as numOfMembers FROM group_students gs
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            LEFT JOIN students s ON st.student_id = s.id
            WHERE gs.term_id = :termId and s.major_id = :majorId
            GROUP BY gs.id`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId, majorId },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupStudents,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const groupStudent = await GroupStudent.findOne({
            where: {
                id: id,
            },
            attributes: {
                exclude: ['term_id', 'updated_at', 'topic_id'],
            },
            include: {
                model: Topic,
                attributes: [
                    'id',
                    'name',
                    'description',
                    'target',
                    'standard_output',
                    'require_input',
                ],
                as: 'topic',
            },
        });

        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get by id success!',
            groupStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getMembersById = async (req, res) => {
    try {
        const { id } = req.params;

        let members = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
            attributes: ['id', 'status', 'isAdmin'],
            include: {
                model: Student,
                attributes: ['id', 'username', 'fullName', 'avatar', 'clazzName'],
                as: 'student',
            },
        });

        const membersWithTranscripts = await Promise.all(
            members.map(async (member) => {
                const transcripts = await sequelize.query(
                    `SELECT e.type, AVG(score) as avgScore FROM transcripts t
                    LEFT JOIN evaluations e ON t.evaluation_id = e.id
                    WHERE student_term_id = :studentTermId
                    GROUP BY e.type`,
                    {
                        type: QueryTypes.SELECT,
                        replacements: { studentTermId: member.id },
                    },
                );

                return {
                    ...member.toJSON(),
                    transcripts,
                };
            }),
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get members success!',
            members: membersWithTranscripts,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getMyGroupStudent = async (req, res) => {
    try {
        const { termId } = req.query;
        const { id } = req.user;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: id,
                term_id: termId,
            },
        });

        if (!studentTerm.group_student_id) {
            return Error.sendNotFound(res, 'Bạn chưa tham gia nhóm sinh viên nào!');
        }

        const members = await StudentTerm.findAll({
            where: {
                group_student_id: studentTerm.group_student_id,
            },
            attributes: ['student_id', 'isAdmin'],
            include: {
                model: Student,
                attributes: ['userName', 'fullName', 'avatarUrl', 'gender', 'phoneNumber', 'email'],
                as: 'student',
            },
        });

        const groupStudent = await GroupStudent.findOne({
            where: {
                id: studentTerm.group_student_id,
            },
            attributes: ['id', 'name', 'status', 'topic_id'],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get success!',
            group: {
                info: groupStudent,
                members,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createGroupStudent = async (req, res) => {
    try {
        const { termId, studentIds } = req.body;

        // Check if student already have a group
        for (let i = 0; i < studentIds.length; i++) {
            const studentTerm = await StudentTerm.findOne({
                where: {
                    student_id: studentIds[i],
                    term_id: termId,
                },
            });

            if (!studentTerm)
                return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');

            if (studentTerm.group_student_id !== null) {
                return Error.sendWarning(res, 'Sinh viên đã có nhóm rồi!');
            }
        }

        // Get number of group student
        const groupStudents = await GroupStudent.findAll({
            where: {
                term_id: termId,
            },
        });

        const group = await GroupStudent.create({
            name: `Nhóm số ${groupStudents.length + 1}`,
            term_id: termId,
        });

        for (let i = 0; i < studentIds.length; i++) {
            const studentTerm = await StudentTerm.findOne({
                where: {
                    student_id: studentIds[i],
                    term_id: termId,
                },
            });

            studentTerm.group_student_id = group.id;

            await studentTerm.save();

            if (i === 0) {
                studentTerm.isAdmin = true;
                await studentTerm.save();
            }
        }

        const groupStudent = await sequelize.query(
            `SELECT gs.id, gs.name, gs.topic_id as topicId, tc.name as topicName, COUNT(st.student_id) as numOfMembers FROM group_students gs
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            LEFT JOIN topics tc ON gs.topic_id = tc.id
            WHERE gs.id = :id
            GROUP BY gs.id`,
            {
                type: QueryTypes.SELECT,
                replacements: { id: group.id },
            },
        );

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create success!',
            groupStudent: groupStudent[0],
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importGroupStudent = async (req, res) => {
    try {
        const { termId } = req.body;

        const studentTermCount = await StudentTerm.count({
            where: {
                term_id: termId,
            },
        });

        const numberOfGroups = Math.ceil(studentTermCount / 2);

        for (let i = 0; i < numberOfGroups; i++) {
            await GroupStudent.create({
                name: `Nhóm số ${i + 1}`,
                term_id: termId,
            });
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.assignAdminGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: studentId,
                group_student_id: id,
            },
        });

        studentTerm.isAdmin = true;
        await studentTerm.save();

        const currentAdmin = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        currentAdmin.isAdmin = false;
        await currentAdmin.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.addMemberGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, termId } = req.body;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: studentId,
                term_id: termId,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        if (studentTerm.group_student_id) {
            return Error.sendWarning(res, 'Sinh viên đã có nhóm rồi!');
        }

        studentTerm.group_student_id = id;

        await studentTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Add member success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteMemberGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, termId } = req.body;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: studentId,
                term_id: termId,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        studentTerm.group_student_id = null;

        await studentTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete member success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.removeMemberGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        const studentAdmin = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        if (!studentAdmin.isAdmin) {
            return Error.sendForbidden(res, 'Bạn không phải là admin của nhóm sinh viên!');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: studentId,
                group_student_id: id,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        studentTerm.group_student_id = null;
        studentTerm.isAdmin = false;

        await studentTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.leaveGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        studentTerm.group_student_id = null;
        studentTerm.isAdmin = false;

        await studentTerm.save();

        const studentTerms = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
        });

        if (studentTerms.length === 0) {
            const groupStudent = await GroupStudent.findByPk(id);
            await groupStudent.destroy();
        } else if (studentTerms.length === 1) {
            studentTerms[0].isAdmin = true;
            await studentTerms[0].save();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Remove success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.joinGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
            },
        });

        if (studentTerm.group_student_id) {
            return Error.sendWarning(res, 'Bạn đã có nhóm rồi!');
        }

        studentTerm.group_student_id = id;
        studentTerm.isAdmin = false;

        await studentTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Join Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.assignTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { topicId } = req.body;
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Group Student not found');
        }

        groupStudent.topic_id = topicId;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            groupStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        await groupStudent.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.chooseTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { topicId } = req.body;

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Group Student not found');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        if (!studentTerm.isAdmin) {
            return Error.sendForbidden(res, 'You are not admin of group');
        }

        const topic = await Topic.findByPk(topicId);
        if (!topic) {
            return Error.sendNotFound(res, 'Topic not found');
        }

        groupStudent.topic_id = topicId;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Choose Topic Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.cancelTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        if (!studentTerm.isAdmin) {
            return Error.sendForbidden(res, 'You are not admin of group');
        }

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Group Student not found');
        }

        groupStudent.topic_id = null;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cancel Topic Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
