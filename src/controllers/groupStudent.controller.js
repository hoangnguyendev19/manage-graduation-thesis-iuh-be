const { GroupStudent, StudentTerm, Student, Topic } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const _ = require('lodash');
const { validationResult } = require('express-validator');

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
                ORDER BY gs.name ASC
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
                ORDER BY gs.name ASC
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
                `SELECT gs.id, gs.name, gs.topic_id as topicId, tc.name as topicName,l.full_name as lecturerName, COUNT(st.student_id) as numOfMembers FROM group_students gs 
                LEFT JOIN student_terms st ON gs.id = st.group_student_id 
                LEFT JOIN topics tc ON gs.topic_id = tc.id 
                LEFT JOIN lecturer_terms lt ON tc.lecturer_term_id = lt.id
                LEFT JOIN lecturers l ON l.id = lt.lecturer_id
                WHERE gs.term_id = :termId
                GROUP BY gs.id
                ORDER BY gs.name ASC
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
            message: 'Lấy danh sách nhóm sinh viên thành công!',
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

exports.getGroupStudentsByLecturerId = async (req, res) => {
    try {
        const { termId, lecturerId } = req.query;

        const groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, tc.name as topicName, COUNT(st.student_id) as numOfMembers FROM group_students gs
            LEFT JOIN topics tc ON gs.topic_id = tc.id
            LEFT JOIN lecturer_terms lt ON tc.lecturer_term_id = lt.id
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            WHERE gs.term_id = :termId and lt.lecturer_id = :lecturerId
            GROUP BY gs.id
            ORDER BY gs.name ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId, lecturerId },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công!',
            groupStudents,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentsByTopicId = async (req, res) => {
    try {
        const { termId, topicId } = req.query;

        let groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, s.username, s.full_name as fullName FROM group_students gs
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            LEFT JOIN students s ON st.student_id = s.id
            WHERE gs.term_id = :termId and gs.topic_id = :topicId
            ORDER BY gs.name ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId, topicId },
            },
        );

        groupStudents = groupStudents.reduce((acc, group) => {
            const { id, name, username, fullName } = group;

            const groupIndex = acc.findIndex((item) => item.id === id);

            if (groupIndex === -1) {
                acc.push({
                    id,
                    name,
                    members: [{ username, fullName }],
                });
            }

            if (groupIndex !== -1) {
                acc[groupIndex].members.push({ username, fullName });
            }

            return acc;
        }, []);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công!',
            groupStudents,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentsByTermId = async (req, res) => {
    try {
        const { termId } = req.query;

        const groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, COUNT(st.student_id) as numOfMembers FROM group_students gs 
                LEFT JOIN student_terms st ON gs.id = st.group_student_id 
                WHERE gs.term_id = :termId
                GROUP BY gs.id
                ORDER BY COUNT(st.student_id) ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    termId,
                },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lây danh sách nhóm sinh viên thành công!',
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
        const groupStudent = await sequelize.query(
            `SELECT gs.id, gs.name, gs.topic_id as topicId, gs.created_at as createdAt, tc.name as topicName, tc.description as topicDescription, tc.target as topicTarget, tc.standard_output as topicStandardOutput, tc.require_input as topicRequireInput, tc.expected_result as topicExpectedResult, l.full_name as lecturerName FROM group_students gs
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            LEFT JOIN topics tc ON gs.topic_id = tc.id
            LEFT JOIN lecturer_terms lt ON tc.lecturer_term_id = lt.id
            LEFT JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE gs.id = :id
            GROUP BY gs.id`,
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            },
        );

        if (groupStudent.length === 0) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin nhóm sinh viên thành công!',
            groupStudent: groupStudent[0],
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentMembers = async (req, res) => {
    try {
        const { id } = req.params;

        const members = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
            attributes: ['id', 'status', 'isAdmin'],
            include: {
                model: Student,
                attributes: ['id', 'username', 'fullName', 'phone', 'email', 'gender', 'clazzName'],
                as: 'student',
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách thành viên nhóm sinh viên thành công!',
            members,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentOfSearch = async (req, res) => {
    try {
        const { termId, page, limit, keywords, searchField } = req.query;
        let offset = (page - 1) * limit;
        let total = 0;

        let searchQuery = searchField ? `and ${searchField} LIKE :keywords` : '';

        const groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, COUNT(st.student_id) as numOfMembers FROM group_students gs 
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            WHERE gs.term_id = :termId ${searchQuery}
            GROUP BY gs.id
            ORDER BY gs.name ASC
            LIMIT :limit OFFSET :offset`,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    termId,
                    keywords: `%${keywords}%`,
                    limit: parseInt(limit),
                    offset,
                },
            },
        );

        total = await sequelize.query(
            `SELECT COUNT(gs.id) as total FROM group_students gs 
            WHERE gs.term_id = :termId ${searchQuery}`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId, keywords: `%${keywords}%` },
            },
        );

        total = total[0].total;

        const totalPage = _.ceil(total / _.toInteger(limit));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công!',
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
                attributes: ['id', 'username', 'fullName', 'clazzName'],
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
            message: 'Lấy danh sách thành viên nhóm sinh viên thành công!',
            members: membersWithTranscripts,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.countOfGroupStudent = async (req, res) => {
    try {
        const { termId } = req.query;
        const count = (await GroupStudent.count({ where: { term_id: termId } })) + 1;

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Count success',
            count: count - 1,
            nameCount: 'Nhóm số ' + count,
        });
    } catch (error) {
        console.log('🚀 ~ exports.countOfGroupStudent= ~ error:', error);
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
                attributes: ['username', 'fullName', 'gender', 'phone', 'email'],
                as: 'student',
            },
        });

        const groupStudent = await GroupStudent.findOne({
            where: {
                id: studentTerm.group_student_id,
            },
            attributes: ['id', 'name', 'topic_id'],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin nhóm sinh viên thành công!',
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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        let group = null;
        // Get number of group student
        const groupStudents = await GroupStudent.findAll({
            where: {
                term_id: termId,
            },
        });

        if (studentIds.length === 0) {
            group = await GroupStudent.create({
                name: `Nhóm số ${groupStudents.length + 1}`,
                term_id: termId,
            });

            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Create success!',
                groupStudent: group,
            });
        }

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

        group = await GroupStudent.create({
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
            message: 'Tạo nhóm sinh viên thành công!',
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
        const numberOfDigits = numberOfGroups.toString().length;

        for (let i = 0; i < numberOfGroups; i++) {
            const groupNumber = (i + 1).toString().padStart(numberOfDigits, '0');
            await GroupStudent.create({
                name: `Nhóm số ${groupNumber}`,
                term_id: termId,
            });
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Nhập nhóm sinh viên thành công!',
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
            message: 'Cập nhật trưởng nhóm thành công!',
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

        const studentTerms = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
        });

        // check if group has no admin
        if (studentTerms.length === 0) {
            studentTerm.isAdmin = true;
        } else {
            studentTerm.isAdmin = false;
        }

        await studentTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Thêm thành viên thành công!',
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
        studentTerm.isAdmin = false;

        await studentTerm.save();

        const studentTerms = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
        });

        if (studentTerms.length === 1) {
            studentTerms[0].isAdmin = true;
            await studentTerms[0].save();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá thành viên thành công!',
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
            message: 'Xoá thành viên thành công!',
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

        if (studentTerms.length === 1) {
            studentTerms[0].isAdmin = true;
            await studentTerms[0].save();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Rời nhóm thành công!',
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

        const studentTerms = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
        });

        // check if group has enough members
        if (studentTerms.length >= 2) {
            return Error.sendForbidden(res, 'Nhóm đã đủ thành viên!');
        }

        // check if group has no admin
        if (studentTerms.length === 0) {
            studentTerm.isAdmin = true;
        } else {
            studentTerm.isAdmin = false;
        }

        await studentTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Tham gia nhóm thành công!',
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
            Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        // Check if group has topic
        if (groupStudent.topic_id) {
            return Error.sendForbidden(res, 'Nhóm sinh viên đã chọn đề tài!');
        }

        // Check if topic has enough group
        const topic = await Topic.findByPk(topicId);
        if (!topic) {
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }

        const groupStudents = await GroupStudent.findAll({
            where: {
                topic_id: topicId,
            },
        });

        if (groupStudents.length >= topic.quantityGroupMax) {
            return Error.sendForbidden(res, 'Số lượng nhóm đã đủ!');
        }

        // Check if topic status is APPROVED
        if (topic.status !== 'APPROVED') {
            return Error.sendForbidden(res, 'Đề tài chưa được phê duyệt!');
        }

        groupStudent.topic_id = topicId;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Chọn đề tài thành công!',
            groupStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.removeTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { topicId } = req.body;

        const groupStudent = await GroupStudent.findByPk(id);

        if (!groupStudent) {
            Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        if (groupStudent.topic_id !== topicId) {
            return Error.sendForbidden(res, 'Nhóm sinh viên không chọn đề tài này!');
        }

        groupStudent.topic_id = null;

        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Huỷ chọn đề tài thành công!',
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
            message: 'Xoá nhóm sinh viên thành công!',
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
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        const studentTerms = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
        });

        if (studentTerms.length < 2) {
            return Error.sendForbidden(
                res,
                'Bạn cần có ít nhất 2 thành viên trong nhóm mới có thể chọn đề tài!',
            );
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        if (!studentTerm.isAdmin) {
            return Error.sendForbidden(res, 'Bạn không phải là trưởng nhóm!');
        }

        const topic = await Topic.findByPk(topicId);
        if (!topic) {
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }

        const groupStudents = await GroupStudent.findAll({
            where: {
                topic_id: topicId,
            },
        });

        if (groupStudents.length >= topic.quantityGroupMax) {
            return Error.sendForbidden(res, 'Số lượng nhóm đã đủ!');
        }

        groupStudent.topic_id = topicId;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Chọn đề tài thành công!',
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
            return Error.sendForbidden(res, 'Bạn không phải là trưởng nhóm!');
        }

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        groupStudent.topic_id = null;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Huỷ chọn đề tài thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
