const {
    GroupStudent,
    StudentTerm,
    Student,
    Topic,
    Term,
    Comment,
    TermDetail,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/mysql.config');
const _ = require('lodash');
const { validationResult } = require('express-validator');
const { validateDate, checkDegree } = require('../helper/handler');
const logger = require('../configs/logger.config');

exports.getGroupStudents = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        let groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, gs.link, gs.topic_id as topicId, tc.name as topicName, l.full_name as lecturerName, l.degree, s.username, s.full_name as fullName, st.status
            FROM group_students gs 
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            LEFT JOIN students s ON st.student_id = s.id
            LEFT JOIN topics tc ON gs.topic_id = tc.id 
            LEFT JOIN lecturer_terms lt ON tc.lecturer_term_id = lt.id
            LEFT JOIN lecturers l ON l.id = lt.lecturer_id
            WHERE gs.term_id = :termId
            ORDER BY gs.name ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    termId,
                },
            },
        );

        groupStudents = groupStudents.reduce((acc, groupStudent) => {
            const group = acc.find((g) => g.id === groupStudent.id);

            if (!group) {
                acc.push({
                    id: groupStudent.id,
                    name: groupStudent.name,
                    link: groupStudent.link,
                    topicId: groupStudent.topicId,
                    topicName: groupStudent.topicName,
                    lecturerName: checkDegree(groupStudent.degree, groupStudent.lecturerName),
                    members: [
                        {
                            username: groupStudent.username,
                            fullName: groupStudent.fullName,
                            status: groupStudent.status,
                        },
                    ],
                });
            } else {
                group.members.push({
                    username: groupStudent.username,
                    fullName: groupStudent.fullName,
                    status: groupStudent.status,
                });
            }

            return acc;
        }, []);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công!',
            groupStudents,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentsByTypeAssign = async (req, res) => {
    try {
        const { termId, type = 'ADVISOR' } = req.query;

        let groupStudents = [];

        if (type === 'ADVISOR') {
            groupStudents = await sequelize.query(
                `SELECT gs.id, gs.name, gs.topic_id as topicId, gs.link, tc.name as topicName
                FROM group_students gs
                INNER JOIN topics tc ON gs.topic_id = tc.id
                INNER JOIN lecturer_terms lt ON lt.id = tc.lecturer_term_id
                WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { termId, lecturerId: req.user.id },
                },
            );
        } else {
            groupStudents = await sequelize.query(
                `SELECT gs.id, gs.name, gs.topic_id as topicId, gs.link, tc.name as topicName
                FROM group_students gs
                INNER JOIN topics tc ON gs.topic_id = tc.id
                INNER JOIN assigns a ON gs.id = a.group_student_id
                INNER JOIN group_lecturer_members glm ON a.group_lecturer_id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId AND a.type = :type`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { termId, lecturerId: req.user.id, type },
                },
            );
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công!',
            groupStudents,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentsByLecturerId = async (req, res) => {
    try {
        const { termId, lecturerId } = req.query;

        let groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, gs.link, tc.name as topicName, s.id as studentId, s.username, s.full_name as fullName, st.status
            FROM group_students gs
            LEFT JOIN topics tc ON gs.topic_id = tc.id
            LEFT JOIN lecturer_terms lt ON tc.lecturer_term_id = lt.id
            LEFT JOIN student_terms st ON gs.id = st.group_student_id
            LEFT JOIN students s ON st.student_id = s.id
            WHERE gs.term_id = :termId and lt.lecturer_id = :lecturerId
            ORDER BY gs.name ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId, lecturerId },
            },
        );

        groupStudents = groupStudents.reduce((acc, groupStudent) => {
            const group = acc.find((g) => g.id === groupStudent.id);

            if (!group) {
                acc.push({
                    id: groupStudent.id,
                    name: groupStudent.name,
                    link: groupStudent.link,
                    topicId: groupStudent.topicId,
                    topicName: groupStudent.topicName,
                    lecturerName: groupStudent.lecturerName,
                    members: [
                        {
                            id: groupStudent.studentId,
                            username: groupStudent.username,
                            fullName: groupStudent.fullName,
                            status: groupStudent.status,
                        },
                    ],
                });
            } else {
                group.members.push({
                    id: groupStudent.studentId,
                    username: groupStudent.username,
                    fullName: groupStudent.fullName,
                    status: groupStudent.status,
                });
            }

            return acc;
        }, []);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công!',
            groupStudents,
        });
    } catch (error) {
        logger.error(error);
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
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentsByTermId = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const termDetail = await TermDetail.findOne({
            where: {
                term_id: term.id,
                name: 'CHOOSE_GROUP',
            },
        });

        // check if now is between start date and end date of term detail
        if (validateDate(termDetail.startDate, termDetail.endDate) === false) {
            return Error.sendWarning(res, 'Hiện tại chưa đến thời gian chọn nhóm!');
        }

        const groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, COUNT(st.student_id) as numOfMembers
            FROM group_students gs 
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
            message: 'Lấy danh sách nhóm sinh viên thành công!',
            groupStudents,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const groupStudent = await sequelize.query(
            `SELECT gs.id, gs.name, gs.created_at as createdAt, tc.name as topicName, tc.description as topicDescription, tc.target as topicTarget, tc.standard_output as topicStandardOutput, tc.require_input as topicRequireInput, tc.expected_result as topicExpectedResult, l.full_name as lecturerName, l.degree
            FROM group_students gs
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

        let members = await sequelize.query(
            `SELECT st.id, st.status, st.is_admin as isAdmin, s.id as studentId, s.username, s.full_name as fullName, sum(a.bonus_score) as bonusScore
            FROM student_terms st
            INNER JOIN students s ON st.student_id = s.id
            LEFT JOIN articles a ON st.id = a.student_term_id
            WHERE st.group_student_id = :id
            GROUP BY st.id, st.status, st.is_admin, s.id, s.username, s.full_name`,
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            },
        );

        const membersWithTranscripts = await Promise.all(
            members.map(async (member) => {
                let transcripts = await sequelize.query(
                    `SELECT l.id, l.full_name as fullName, l.degree, e.type, sum(t.score) / sum(e.score_max) * 10 as avgScore
                    FROM transcripts t
                    INNER JOIN evaluations e ON t.evaluation_id = e.id
                    INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                    INNER JOIN lecturers l ON lt.lecturer_id = l.id
                    WHERE t.student_term_id = :studentTermId
                    GROUP BY l.id, l.full_name, l.degree, e.type`,
                    {
                        type: QueryTypes.SELECT,
                        replacements: { studentTermId: member.id },
                    },
                );

                transcripts = transcripts.map((transcript) => {
                    return {
                        ...transcript,
                        fullName: checkDegree(transcript.degree, transcript.fullName),
                        degree: undefined,
                        avgScore: Number(transcript.avgScore.toFixed(2)),
                    };
                });

                const advisor = transcripts.find((transcript) => transcript.type === 'ADVISOR');
                const firstReviewer = transcripts.filter(
                    (transcript) => transcript.type === 'REVIEWER',
                )[0];
                const secondReviewer = transcripts.filter(
                    (transcript) => transcript.type === 'REVIEWER',
                )[1];
                const firstReport = transcripts.filter(
                    (transcript) => transcript.type === 'REPORT',
                )[0];
                const secondReport = transcripts.filter(
                    (transcript) => transcript.type === 'REPORT',
                )[1];
                const thirdReport = transcripts.filter(
                    (transcript) => transcript.type === 'REPORT',
                )[2];

                return {
                    ...member,
                    advisor: advisor || null,
                    firstReviewer: firstReviewer || null,
                    secondReviewer: secondReviewer || null,
                    firstReport: firstReport || null,
                    secondReport: secondReport || null,
                    thirdReport: thirdReport || null,
                    bonusScore: member.bonusScore || 0,
                };
            }),
        );

        let groupLecturers = await sequelize.query(
            `SELECT gl.id, gl.name, gl.type, gl.start_date as startDate, gl.end_date as endDate, gl.location, l.id as lecturerId, l.full_name as fullName, l.degree, glm.position
            FROM group_lecturers gl
            INNER JOIN assigns a ON gl.id = a.group_lecturer_id
            INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
            INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE a.group_student_id = :id`,
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            },
        );

        groupLecturers = groupLecturers.reduce((acc, groupLecturer) => {
            const group = acc.find((g) => g.id === groupLecturer.id);

            if (!group) {
                acc.push({
                    id: groupLecturer.id,
                    name: groupLecturer.name,
                    type: groupLecturer.type,
                    startDate: groupLecturer.startDate,
                    endDate: groupLecturer.endDate,
                    location: groupLecturer.location,
                    members: [
                        {
                            id: groupLecturer.lecturerId,
                            fullName: checkDegree(groupLecturer.degree, groupLecturer.fullName),
                            position: groupLecturer.position,
                        },
                    ],
                });
            } else {
                group.members.push({
                    id: groupLecturer.lecturerId,
                    fullName: checkDegree(groupLecturer.degree, groupLecturer.fullName),
                    position: groupLecturer.position,
                });
            }

            return acc;
        }, []);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin nhóm sinh viên thành công!',
            groupStudent: {
                info: {
                    ...groupStudent[0],
                    lecturerName: checkDegree(groupStudent[0].degree, groupStudent[0].lecturerName),
                },
                members: membersWithTranscripts,
                groupLecturers,
            },
        });
    } catch (error) {
        logger.error(error);
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
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.searchGroupStudentByName = async (req, res) => {
    try {
        const { termId, name } = req.query;

        const groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name FROM group_students gs
            WHERE gs.term_id = :termId and gs.name LIKE :name
            ORDER BY gs.name ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId, name: `%${name}` },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công!',
            groupStudents,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.countGroupStudents = async (req, res) => {
    try {
        const { termId } = req.query;
        const count = (await GroupStudent.count({ where: { term_id: termId } })) + 1;

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng nhóm sinh viên thành công!',
            count: count - 1,
            nameCount: 'Nhóm số ' + count,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.countGroupStudentsByLecturerId = async (req, res) => {
    try {
        const { termId } = req.query;

        const count = await sequelize.query(
            `SELECT COUNT(gs.id) as total
            FROM group_students gs
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE gs.term_id = :termId AND lt.lecturer_id = :lecturerId`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId, lecturerId: req.user.id },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng nhóm sinh viên hướng dẫn thành công!',
            count: count[0].total,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getMyGroupStudent = async (req, res) => {
    try {
        const { termId } = req.query;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
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
            attributes: ['student_id', 'isAdmin', 'status'],
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
            attributes: ['id', 'name', 'link', 'topic_id'],
        });

        let groupLecturers = await sequelize.query(
            `SELECT gl.id, gl.name, gl.type, gl.start_date as startDate, gl.end_date as endDate, gl.location, lt.id as lecturerTermId, l.full_name as fullName, l.degree
            FROM group_lecturers gl
            INNER JOIN assigns a ON gl.id = a.group_lecturer_id
            INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
            INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE a.group_student_id = :id`,
            {
                type: QueryTypes.SELECT,
                replacements: { id: studentTerm.group_student_id },
            },
        );

        const newGroupLecturers = [];
        for (const groupLecturer of groupLecturers) {
            const group = newGroupLecturers.find((g) => g.id === groupLecturer.id);

            const comment = await Comment.findOne({
                attributes: ['content'],
                where: {
                    group_student_id: studentTerm.group_student_id,
                    lecturer_term_id: groupLecturer.lecturerTermId,
                    type: groupLecturer.type,
                },
            });

            if (!group) {
                newGroupLecturers.push({
                    id: groupLecturer.id,
                    name: groupLecturer.name,
                    type: groupLecturer.type,
                    startDate: groupLecturer.startDate,
                    endDate: groupLecturer.endDate,
                    location: groupLecturer.location,
                    members: [
                        {
                            id: groupLecturer.lecturerTermId,
                            fullName: checkDegree(groupLecturer.degree, groupLecturer.fullName),
                            comment: comment?.content || null,
                        },
                    ],
                });
            } else {
                group.members.push({
                    id: groupLecturer.lecturerTermId,
                    fullName: checkDegree(groupLecturer.degree, groupLecturer.fullName),
                    comment: comment?.content || null,
                });
            }
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin nhóm sinh viên thành công!',
            group: {
                info: groupStudent,
                members,
                groupLecturers: newGroupLecturers,
            },
        });
    } catch (error) {
        logger.error(error);
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

        const lastGroupStudent = await sequelize.query(
            `SELECT gs.name
            FROM group_students gs
            WHERE gs.term_id = :termId
            ORDER BY gs.name DESC
            LIMIT 1`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId },
            },
        );

        let name = '001';
        if (lastGroupStudent.length > 0) {
            const currentName = parseInt(lastGroupStudent[0].name, 10) + 1;
            name = currentName.toString().padStart(3, '0');
        }

        if (studentIds.length === 0) {
            group = await GroupStudent.create({
                name,
                term_id: termId,
            });

            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Tạo nhóm sinh viên thành công!',
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
            name: `${name}`,
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
        logger.error(error);
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
            const groupNumber = (i + 1).toString().padStart(3, '0');
            await GroupStudent.create({
                name: `${groupNumber}`,
                term_id: termId,
            });
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Nhập nhóm sinh viên thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.exportGroupStudents = async (req, res) => {
    try {
        const { termId } = req.query;

        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kỳ!');
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // column: Mã nhóm, Mã SV, Họ tên SV, GVHD, Mã đề tài, Tên đề tài
        let groupStudents = await sequelize.query(
            `SELECT gs.name as groupName, s.username, s.full_name as fullName, l.full_name as lecturerName, l.degree, t.key, t.name as topicName
            FROM group_students gs
            INNER JOIN student_terms st ON gs.id = st.group_student_id
            INNER JOIN students s ON st.student_id = s.id
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE gs.term_id = :termId
            ORDER BY gs.name ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: { termId },
            },
        );

        for (let i = 0; i < groupStudents.length; i++) {
            groupStudents[i]['STT'] = i + 1;
            groupStudents[i]['Mã nhóm'] = groupStudents[i].groupName;
            groupStudents[i]['Mã SV'] = groupStudents[i].username;
            groupStudents[i]['Họ tên SV'] = groupStudents[i].fullName;
            groupStudents[i]['GVHD'] = checkDegree(
                groupStudents[i].degree,
                groupStudents[i].lecturerName,
            );
            groupStudents[i]['Mã đề tài'] = groupStudents[i].key;
            groupStudents[i]['Tên đề tài'] = groupStudents[i].topicName;
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách nhóm sinh viên thành công!',
            groupStudents,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.exportGroupStudentsByLecturerId = async (req, res) => {
    try {
        const { termId } = req.query;

        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kỳ!');
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // column: Mã nhóm, Mã SV, Họ tên SV, GVHD, Mã đề tài, Tên đề tài
        let groupStudents = await sequelize.query(
            `SELECT gs.name as 'Mã nhóm', s.username as 'Mã SV', s.full_name as 'Họ tên SV', l.full_name as 'GVHD', t.key as 'Mã đề tài', t.name as 'Tên đề tài'
            FROM group_students gs
            INNER JOIN student_terms st ON gs.id = st.group_student_id
            INNER JOIN students s ON st.student_id = s.id
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE gs.term_id = :termId AND lt.lecturer_id = :lecturerId
            ORDER BY gs.name ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    termId,
                    lecturerId: req.user.id,
                },
            },
        );

        for (let i = 0; i < groupStudents.length; i++) {
            groupStudents[i]['STT'] = i + 1;
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách nhóm sinh viên hướng dẫn của giảng viên thành công!',
            groupStudents,
        });
    } catch (error) {
        logger.error(error);
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
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.addMemberGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, termId } = req.body;

        // check term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

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
                isAdmin: true,
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
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.deleteMemberGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, termId } = req.body;

        // check term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: studentId,
                term_id: termId,
                group_student_id: id,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong nhóm học kỳ!');
        }

        studentTerm.group_student_id = null;
        studentTerm.isAdmin = false;

        await studentTerm.save();

        const studentTerms = await StudentTerm.findAll({
            where: {
                group_student_id: id,
                isAdmin: false,
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
        logger.error(error);
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
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.leaveGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

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
                isAdmin: false,
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
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.joinGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                term_id: groupStudent.term_id,
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
        logger.error(error);
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
        if (groupStudent.topic_id !== null) {
            return Error.sendForbidden(res, 'Nhóm sinh viên đã chọn đề tài!');
        }

        // Check if topic has enough group
        const topic = await Topic.findByPk(topicId);
        if (!topic) {
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }

        const count = await GroupStudent.count({
            where: {
                topic_id: topicId,
            },
        });

        if (count >= topic.quantityGroupMax) {
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
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.removeTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        groupStudent.topic_id = null;

        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Huỷ chọn đề tài thành công!',
        });
    } catch (error) {
        logger.error(error);
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

        const studentTerms = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
        });
        if (studentTerms.length > 0) {
            return Error.sendForbidden(
                res,
                'Nhóm sinh viên đã có thành viên, không thể xoá! Chỉ được phép xoá khi nhóm không có thành viên!',
            );
        }

        await groupStudent.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá nhóm sinh viên thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.chooseTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { topicId } = req.body;

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(
                res,
                'Hiện tại bạn chưa tham gia nhóm sinh viên nào! Cần tham gia nhóm trước khi chọn đề tài!',
            );
        }

        if (groupStudent.topic_id) {
            return Error.sendForbidden(
                res,
                'Nhóm của bạn đã có đề tài! Bạn vui lòng thực hiện huỷ đề tài hiện tại trước khi chọn đề tài mới!',
            );
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
            return Error.sendForbidden(
                res,
                'Bạn không phải là trưởng nhóm nên không thể chọn đề tài!',
            );
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
            return Error.sendForbidden(res, 'Số lượng nhóm chọn đề tài đã đạt tối đa!');
        }

        groupStudent.topic_id = topicId;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Chọn đề tài thành công!',
        });
    } catch (error) {
        logger.error(error);
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
            return Error.sendForbidden(
                res,
                'Bạn không phải là trưởng nhóm nên không thể huỷ đề tài!',
            );
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
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.submitLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { link } = req.body;

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        groupStudent.link = link;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Nộp link tài liệu thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};
