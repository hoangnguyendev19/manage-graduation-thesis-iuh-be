const {
    GroupLecturer,
    LecturerTerm,
    GroupLecturerMember,
    Term,
    Assign,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/mysql.config');
const { QueryTypes } = require('sequelize');
const _ = require('lodash');
const { validationResult } = require('express-validator');
const { checkDegree } = require('../helper/handler');
const logger = require('../configs/logger.config');

exports.getLecturerNoGroupByType = async (req, res) => {
    try {
        const { termId } = req.query;
        const { type } = req.params;

        const lecturerTerm = await sequelize.query(
            `SELECT l.id, l.username, l.full_name AS fullName, l.is_active AS isActive, l.major_id AS majorId
            FROM lecturers l
            LEFT JOIN lecturer_terms lt ON l.id = lt.lecturer_id
            WHERE lt.term_id = :termId AND lt.id NOT IN 
            (SELECT lt.id 
            FROM lecturer_terms lt
            INNER JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id
            INNER JOIN group_lecturers gl ON gl.id = glm.group_lecturer_id
            WHERE gl.type = :groupType)`,
            {
                replacements: {
                    termId,
                    groupType: type.toUpperCase(),
                },
                type: QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách giảng viên chưa tham gia nhóm thành công',
            lecturers: lecturerTerm,
            totalRows: lecturerTerm.length,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturers = async (req, res) => {
    try {
        const { termId, type = 'reviewer' } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        let groupLecturers = await sequelize.query(
            `SELECT gl.id, gl.name, gl.start_date as startDate, gl.end_date as endDate, gl.location, l.id as lecturerId, l.full_name as fullName, l.degree, glm.position
            FROM group_lecturers gl
            INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
            INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE gl.term_id = :termId AND gl.type = :type
            ORDER BY gl.name ASC`,
            {
                replacements: {
                    termId,
                    type: type.toUpperCase(),
                },
                type: QueryTypes.SELECT,
            },
        );

        if (groupLecturers.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Không có nhóm giảng viên nào!',
                groupLecturers: [],
            });
        }

        groupLecturers = groupLecturers.reduce((acc, groupLecturer) => {
            const group = acc.find((g) => g.id === groupLecturer.id);
            if (!group) {
                acc.push({
                    id: groupLecturer.id,
                    name: groupLecturer.name,
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

        const totalAssigns = await sequelize.query(
            `SELECT gl.id, COUNT(a.group_student_id) as totalAssigns
            FROM group_lecturers gl
            INNER JOIN assigns a ON gl.id = a.group_lecturer_id
            WHERE gl.term_id = :termId AND gl.type = :type
            GROUP BY gl.id`,
            {
                replacements: {
                    termId,
                    type: type.toUpperCase(),
                },
                type: QueryTypes.SELECT,
            },
        );

        groupLecturers = groupLecturers.map((groupLecturer) => {
            const totalAssign = totalAssigns.find((assign) => assign.id === groupLecturer.id);
            return {
                ...groupLecturer,
                totalAssigns: totalAssign ? totalAssign.totalAssigns : 0,
            };
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm giảng viên thành công!',
            groupLecturers,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturersByLecturerId = async (req, res) => {
    try {
        const { termId, lecturerId, type } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: termId,
            },
            attributes: ['id'],
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kỳ này');
        }

        let groupLecturers = await sequelize.query(
            `SELECT gl.id, gl.name, gl.type, gl.start_date AS startDate, gl.end_date AS endDate, gl.location, l.id AS lecturerId, l.full_name AS fullName, l.degree, glm.position
            FROM group_lecturers gl
            INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
            INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            INNER JOIN majors m ON l.major_id = m.id
            WHERE gl.term_id = :termId AND gl.type = :type`,
            {
                replacements: {
                    termId,
                    type: type.toUpperCase(),
                },
                type: QueryTypes.SELECT,
            },
        );

        groupLecturers = groupLecturers.reduce((acc, curr) => {
            const group = acc.find((g) => g.groupLecturerId === curr.id);

            if (!group) {
                acc.push({
                    groupLecturerId: curr.id,
                    name: curr.name,
                    type: curr.type,
                    startDate: curr.startDate,
                    endDate: curr.endDate,
                    location: curr.location,
                    members: [
                        {
                            id: curr.lecturerId,
                            fullName: checkDegree(curr.degree, curr.fullName),
                            position: curr.position,
                        },
                    ],
                });
            } else {
                group.members.push({
                    id: curr.lecturerId,
                    fullName: checkDegree(curr.degree, curr.fullName),
                    position: curr.position,
                });
            }

            return acc;
        }, []);

        groupLecturers = groupLecturers.filter((groupLecturer) =>
            groupLecturer.members.some((member) => member.id === lecturerId),
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm giảng viên thành công!',
            groupLecturers,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturersByTypeEvaluation = async (req, res) => {
    try {
        const { termId, type = 'reviewer' } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        let groupLecturers = [];

        if (type === 'reviewer') {
            groupLecturers = await sequelize.query(
                `SELECT gl.id, gl.name, gl.type, l.id as lecturerId, l.username, l.full_name as fullName, l.degree
                FROM group_lecturers gl
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE gl.term_id = :termId AND gl.type = 'REVIEWER'
                ORDER BY gl.name ASC`,
                {
                    replacements: {
                        termId,
                    },
                    type: QueryTypes.SELECT,
                },
            );
        } else if (type === 'report') {
            groupLecturers = await sequelize.query(
                `SELECT gl.id, gl.name, gl.type, l.id as lecturerId, l.username, l.full_name as fullName, l.degree
                FROM group_lecturers gl
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE gl.term_id = :termId AND NOT gl.type = 'REVIEWER'
                ORDER BY gl.name ASC`,
                {
                    replacements: {
                        termId,
                    },
                    type: QueryTypes.SELECT,
                },
            );
        }

        groupLecturers = groupLecturers.reduce((acc, groupLecturer) => {
            const group = acc.find((g) => g.id === groupLecturer.id);

            if (!group) {
                acc.push({
                    id: groupLecturer.id,
                    name: groupLecturer.name,
                    type: groupLecturer.type,
                    members: [
                        {
                            id: groupLecturer.lecturerId,
                            username: groupLecturer.username,
                            fullName: checkDegree(groupLecturer.degree, groupLecturer.fullName),
                        },
                    ],
                });
            } else {
                group.members.push({
                    id: groupLecturer.lecturerId,
                    username: groupLecturer.username,
                    fullName: checkDegree(groupLecturer.degree, groupLecturer.fullName),
                });
            }

            return acc;
        }, []);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm giảng viên theo loại đánh giá thành công!',
            groupLecturers,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturersByTypeEvaluationAndLecturerId = async (req, res) => {
    try {
        const { termId, type = 'reviewer', lecturerId } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        let groupLecturers = [];

        if (type === 'reviewer') {
            groupLecturers = await sequelize.query(
                `SELECT gl.id, gl.name, gl.type, l.id as lecturerId, l.username, l.full_name as fullName
                FROM group_lecturers gl
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE gl.term_id = :termId AND gl.type = 'REVIEWER'
                ORDER BY gl.name ASC`,
                {
                    replacements: {
                        termId,
                    },
                    type: QueryTypes.SELECT,
                },
            );
        } else if (type === 'report') {
            groupLecturers = await sequelize.query(
                `SELECT gl.id, gl.name, gl.type, l.id as lecturerId, l.username, l.full_name as fullName
                FROM group_lecturers gl
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE gl.term_id = :termId AND NOT gl.type = 'REVIEWER'
                ORDER BY gl.name ASC`,
                {
                    replacements: {
                        termId,
                    },
                    type: QueryTypes.SELECT,
                },
            );
        }

        groupLecturers = groupLecturers.reduce((acc, groupLecturer) => {
            const group = acc.find((g) => g.id === groupLecturer.id);

            if (!group) {
                acc.push({
                    id: groupLecturer.id,
                    name: groupLecturer.name,
                    type: groupLecturer.type,
                    members: [
                        {
                            id: groupLecturer.lecturerId,
                            username: groupLecturer.username,
                            fullName: groupLecturer.fullName,
                        },
                    ],
                });
            } else {
                group.members.push({
                    id: groupLecturer.lecturerId,
                    username: groupLecturer.username,
                    fullName: groupLecturer.fullName,
                });
            }

            return acc;
        }, []);

        groupLecturers = groupLecturers.filter((groupLecturer) =>
            groupLecturer.members.some((member) => member.id === lecturerId),
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm giảng viên theo loại đánh giá thành công!',
            groupLecturers,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturerById = async (req, res) => {
    try {
        const { id } = req.params;

        const groupLecturer = await GroupLecturer.findByPk(id, {
            attributes: ['id', 'name', 'type', 'keywords', 'startDate', 'endDate', 'location'],
        });

        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Nhóm giảng viên không tồn tại!');
        }

        let members = await sequelize.query(
            `SELECT l.id, l.username, l.full_name as fullName, l.degree, m.name as majorName, glm.position
            FROM group_lecturers gl
            INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
            INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            INNER JOIN majors m ON l.major_id = m.id
            WHERE gl.id = :id`,
            {
                replacements: {
                    id,
                },
                type: QueryTypes.SELECT,
            },
        );

        members = members.map((member) => {
            return {
                ...member,
                fullName: checkDegree(member.degree, member.fullName),
            };
        });

        let groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, gs.link, t.name as topicName, lt.id as lecturerTermId, l.id as lecturerId, l.full_name as lecturerName, l.degree, s.username, s.full_name as fullName
            FROM group_students gs
            INNER JOIN assigns a ON gs.id = a.group_student_id
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            INNER JOIN student_terms st ON gs.id = st.group_student_id
            INNER JOIN students s ON st.student_id = s.id
            WHERE a.group_lecturer_id = :id`,
            {
                replacements: {
                    id,
                },
                type: QueryTypes.SELECT,
            },
        );

        groupStudents = groupStudents.reduce((acc, groupStudent) => {
            const group = acc.find((g) => g.id === groupStudent.id);

            if (!group) {
                acc.push({
                    id: groupStudent.id,
                    name: groupStudent.name,
                    link: groupStudent.link,
                    topicName: groupStudent.topicName,
                    lecturerTermId: groupStudent.lecturerTermId,
                    lecturerId: groupStudent.lecturerId,
                    lecturerName: checkDegree(groupStudent.degree, groupStudent.lecturerName),
                    members: [
                        {
                            username: groupStudent.username,
                            fullName: groupStudent.fullName,
                        },
                    ],
                });
            } else {
                group.members.push({
                    username: groupStudent.username,
                    fullName: groupStudent.fullName,
                });
            }
            return acc;
        }, []);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin nhóm giảng viên thành công!',
            groupLecturer: {
                ...groupLecturer.toJSON(),
                members,
                groupStudents,
            },
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.searchGroupLecturerByName = async (req, res) => {
    try {
        const { termId, name } = req.query;

        const groupLecturers = await sequelize.query(
            `SELECT gl.id, gl.name FROM group_lecturers gl
            WHERE gl.term_id = :termId AND gl.name LIKE :name
            ORDER BY gl.name ASC`,
            {
                replacements: {
                    termId,
                    name: `%${name}%`,
                },
                type: QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Tìm kiếm nhóm giảng viên thành công!',
            groupLecturers,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.countGroupLecturersByTermId = async (req, res) => {
    try {
        const { termId } = req.query;
        const count = await GroupLecturer.count({
            where: { term_id: termId },
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng nhóm giảng viên trong học kì thành công!',
            count,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.countGroupLecturersByLecturerId = async (req, res) => {
    try {
        const { termId } = req.query;

        const count = await sequelize.query(
            `SELECT COUNT(gl.id) as total
            FROM group_lecturers gl
            INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
            INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId`,
            {
                replacements: {
                    termId,
                    lecturerId: req.user.id,
                },
                type: QueryTypes.SELECT,
            },
        );

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng nhóm giảng viên của giảng viên thành công!',
            count: count[0].total,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.createGroupLecturer = async (req, res) => {
    try {
        const { termId, lecturers, type, keywords } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        if (type === 'report_council') {
            const existingLecturerIds = await sequelize.query(
                `SELECT lt.lecturer_id as id 
                FROM group_lecturers gl
                INNER JOIN group_lecturer_members glm ON glm.group_lecturer_id = gl.id
                INNER JOIN lecturer_terms lt ON lt.id = glm.lecturer_term_id 
                WHERE lt.term_id = :termId AND gl.type = :type`,
                {
                    replacements: {
                        termId,
                        type: type.toUpperCase(),
                    },
                    type: QueryTypes.SELECT,
                },
            );

            const isExist = lecturers.some((lec) =>
                existingLecturerIds.map((e) => e.id).includes(lec),
            );

            if (isExist) {
                return Error.sendConflict(
                    res,
                    'Giảng viên đã tồn tại trong nhóm khác với cùng loại nhóm',
                );
            }
        } else {
            const groupLecturerIds = await GroupLecturer.findAll({
                where: { term_id: termId, type: type.toUpperCase() },
                attributes: ['id'],
            });

            let isExist = false;

            for (const groupLecturerId of groupLecturerIds) {
                const groupLecturerMembers = await sequelize.query(
                    `SELECT lt.lecturer_id as id
                    FROM group_lecturer_members glm
                    INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                    WHERE glm.group_lecturer_id = :groupLecturerId`,
                    {
                        replacements: { groupLecturerId: groupLecturerId.id },
                        type: QueryTypes.SELECT,
                    },
                );

                if (_.isEqual(groupLecturerMembers.map((lec) => lec.id).sort(), lecturers.sort())) {
                    isExist = true;
                    break;
                }
            }

            if (isExist) {
                return Error.sendConflict(res, 'Nhóm giảng viên đã tồn tại với loại nhóm này');
            }
        }

        const countGr = await GroupLecturer.count({
            where: { term_id: termId, type: type.toUpperCase() },
        });
        const groupName = `${(countGr + 1).toString().padStart(2, '0')}`;

        const groupLecturer = await GroupLecturer.create({
            name: groupName,
            term_id: termId,
            type: type.toUpperCase(),
            keywords,
        });

        const lecturerTerms = await LecturerTerm.findAll({
            where: {
                lecturer_id: lecturers,
                term_id: termId,
            },
        });

        if (lecturerTerms.length === 0) {
            return Error.sendNotFound(res, 'Không tìm thấy giảng viên hợp lệ trong học kỳ này.');
        }

        let groupLecturerMembers = [];
        if (type === 'report_council') {
            groupLecturerMembers = lecturerTerms.map((lecturerTerm, index) => ({
                group_lecturer_id: groupLecturer.id,
                lecturer_term_id: lecturerTerm.id,
                position: index === 0 ? 'PRESIDENT' : index === 1 ? 'VICE_PRESIDENT' : 'SECRETARY',
            }));
        } else {
            groupLecturerMembers = lecturerTerms.map((lecturerTerm, index) => ({
                group_lecturer_id: groupLecturer.id,
                lecturer_term_id: lecturerTerm.id,
                position: index === 0 ? 'MEMBER_ONE' : 'MEMBER_TWO',
            }));
        }

        await GroupLecturerMember.bulkCreate(groupLecturerMembers);

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo nhóm giảng viên mới thành công',
            groupLecturer,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.deleteGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;

        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Nhóm giảng viên không tồn tại!');
        }

        await GroupLecturerMember.destroy({
            where: {
                group_lecturer_id: id,
            },
        });

        await Assign.destroy({
            where: {
                group_lecturer_id: id,
            },
        });

        const termId = groupLecturer.term_id;
        const type = groupLecturer.type;

        await groupLecturer.destroy();

        // I want to update the name of the remaining groups
        const groupLecturers = await GroupLecturer.findAll({
            where: { term_id: termId, type },
            attributes: ['id', 'name'],
        });

        for (let i = 0; i < groupLecturers.length; i++) {
            await groupLecturers[i].update({
                name: (i + 1).toString().padStart(2, '0'),
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá nhóm giảng viên thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getMemberFromGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;

        const oldGr = await GroupLecturer.findByPk(id);
        if (!oldGr) {
            return Error.sendNotFound(res, 'Không có nhóm giảng viên này');
        }

        const groupLecturerMembers = await sequelize.query(
            `SELECT l.id, l.username, l.full_name as fullName, l.email, l.gender, l.degree, l.is_active, l.major_id, glm.position
        FROM lecturers l 
        INNER JOIN lecturer_terms lt ON l.id = lt.lecturer_id
        INNER JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id 
        INNER JOIN group_lecturers gl ON glm.group_lecturer_id = gl.id 
        WHERE gl.id = :id and l.id = :lecturerId`,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    id,
                    lecturerId: req.user.id,
                },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin thành viên nhóm giảng viên thành công!',
            groupLecturerMembers: {
                groupLecturerId: oldGr.id,
                termId: oldGr.term_id,
                ...groupLecturerMembers[0],
            },
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.removeLecturerFromGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { lecturerId } = req.body;

        const groupLecturer = await GroupLecturer.findByPk(id);

        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Nhóm giảng viên không tồn tại!');
        }

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: groupLecturer.term_id,
            },
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kì này');
        }

        const member = await GroupLecturerMember.findOne({
            where: {
                group_lecturer_id: id,
                lecturer_term_id: lecturerTerm.id,
            },
        });

        await member.destroy();

        const groupLecturerMembers = await GroupLecturerMember.findAll({
            where: {
                group_lecturer_id: id,
            },
        });

        if (groupLecturerMembers.length === 0) {
            await Assign.destroy({
                where: {
                    group_lecturer_id: id,
                },
            });

            await groupLecturer.destroy();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xóa giảng viên ra khỏi nhóm thành công',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.addMemberToGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { lecturerId } = req.body;

        // Check if the group exists
        const oldGr = await GroupLecturer.findByPk(id);
        if (!oldGr) {
            return Error.sendNotFound(res, 'Không có nhóm giảng viên này');
        }

        // Check if the lecturer already exists in the group
        const existingMembers = await sequelize.query(
            `SELECT l.id 
            FROM lecturers l 
            JOIN lecturer_terms lt ON lt.lecturer_id = l.id 
            RIGHT JOIN group_lecturer_members glm ON glm.lecturer_term_id = lt.id 
            WHERE glm.group_lecturer_id = :id AND l.id = :lecturerId`,
            {
                replacements: { id, lecturerId },
                type: QueryTypes.SELECT,
            },
        );

        if (existingMembers.length > 0) {
            return Error.sendConflict(res, 'Giảng viên đã tham gia nhóm này');
        }

        // Check if the group is full (assuming max group size is 2)
        const currentMembers = await GroupLecturerMember.count({
            where: { group_lecturer_id: id },
        });
        if (currentMembers >= 3) {
            return Error.sendNotFound(res, 'Nhóm đã đủ số lượng thành viên tối đa');
        }

        // Check if the lecturer exists for the same term
        const oldLecturer = await LecturerTerm.findOne({
            where: { term_id: oldGr.term_id, lecturer_id: lecturerId },
        });
        if (!oldLecturer) {
            return Error.sendForbidden(res, 'Không tồn tại giảng viên trong học kì này');
        }

        // Add the lecturer to the group
        const newMember = await GroupLecturerMember.create({
            group_lecturer_id: id,
            lecturer_term_id: oldLecturer.id,
        });

        const groupLecturerMember = await GroupLecturerMember.findByPk(newMember.id);

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Thêm giảng viên thành công',
            groupLecturerMember,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateDateAndLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, location } = req.body;

        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Nhóm giảng viên không tồn tại!');
        }

        await groupLecturer.update({
            startDate,
            endDate,
            location,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thông tin ngày và địa điểm thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { lecturerId, position } = req.body;

        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Nhóm giảng viên không tồn tại!');
        }

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: groupLecturer.term_id,
            },
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kì này');
        }

        const groupLecturerMember = await GroupLecturerMember.findOne({
            where: {
                group_lecturer_id: id,
                lecturer_term_id: lecturerTerm.id,
            },
        });

        await groupLecturerMember.update({
            position,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật chức vụ thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};
