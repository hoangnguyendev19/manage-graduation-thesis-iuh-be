const { GroupLecturer, LecturerTerm, GroupLecturerMember } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');
const { QueryTypes } = require('sequelize');
const _ = require('lodash');
const { validationResult } = require('express-validator');

const checkTypeGroup = (value) => {
    switch (value) {
        case 'REVIEWER':
            return 'Nhóm chấm phản biện';
        case 'REPORT_POSTER':
            return 'Nhóm chấm poster ';
        case 'REPORT_COUNCIL':
            return 'Nhóm chấm hội đồng';
    }
};

exports.getLecturerNoGroupByType = async (req, res) => {
    try {
        const { termId } = req.query;
        const { type } = req.params;
        const subQuery = `SELECT lt.id FROM lecturer_terms lt INNER JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id LEFT JOIN  group_lecturers gl ON gl.id  = glm.group_lecturer_id WHERE gl.type = '${type.toUpperCase()}' `;

        const query = `SELECT l.id, l.username, l.full_name as fullName, l.is_active as isActive, l.major_id as majorId    
             FROM lecturers l LEFT JOIN majors m ON l.major_id = m.id LEFT JOIN lecturer_terms lt ON l.id = lt.lecturer_id
            WHERE lt.term_id = :termId AND lt.id NOT IN (${subQuery})`;

        const lecturerTerm = await sequelize.query(query, {
            replacements: {
                termId,
            },
            type: QueryTypes.SELECT,
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách giảng viên chưa tham gia nhóm thành công',
            lecturers: lecturerTerm,
            totalRows: lecturerTerm.length,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturers = async (req, res) => {
    try {
        const { termId, type = 'reviewer' } = req.query;

        let groupLecturers = await sequelize.query(
            `SELECT gl.id, gl.name, l.username, l.full_name as fullName
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
                    members: [
                        {
                            username: groupLecturer.username,
                            fullName: groupLecturer.fullName,
                        },
                    ],
                });
            } else {
                group.members.push({
                    username: groupLecturer.username,
                    fullName: groupLecturer.fullName,
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
        console.log('🚀 ~ getGroupLecturers ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturersByLecturerId = async (req, res) => {
    try {
        const { termId, lecturerId } = req.query;

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: termId,
            },
            attributes: ['id'],
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kì này');
        }

        const groupLecturers = await sequelize.query(
            `SELECT gr.id as groupLecturerId, gr.name, gr.type 
            FROM group_lecturers gr
            LEFT JOIN group_lecturer_members grm ON gr.id = grm.group_lecturer_id
            WHERE grm.lecturer_term_id = :lecturerTermId`,
            {
                replacements: {
                    lecturerTermId: lecturerTerm.id,
                },
                type: QueryTypes.SELECT,
            },
        );

        const result = await Promise.all(
            groupLecturers.map(async (groupLecturer) => {
                const members = await sequelize.query(
                    `SELECT l.id, l.username, l.full_name as fullName, l.gender, m.name as majorName
                    FROM lecturers l
                    JOIN lecturer_terms lt ON l.id = lt.lecturer_id
                    JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id
                    JOIN majors m ON l.major_id = m.id
                    WHERE glm.group_lecturer_id = :groupLecturerId`,
                    {
                        type: QueryTypes.SELECT,
                        replacements: {
                            groupLecturerId: groupLecturer.groupLecturerId,
                        },
                    },
                );

                return {
                    groupLecturerId: groupLecturer.groupLecturerId,
                    name: groupLecturer.name,
                    type: groupLecturer.type,
                    members,
                };
            }),
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm giảng viên thành công!',
            groupLecturers: result,
        });
    } catch (error) {
        console.error('🚀 ~ getGroupLecturersByLecturerId ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturerById = async (req, res) => {
    try {
        const { id } = req.params;

        const groupLecturerName = await GroupLecturer.findByPk(id, {
            attributes: ['name'],
        });

        const members = await sequelize.query(
            `SELECT l.id, l.username, l.full_name as fullName, l.degree, m.name as majorName
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

        let groupStudents = await sequelize.query(
            `SELECT gs.id, gs.name, t.name as topicName, lt.id as lecturerTermId, l.full_name as lecturerName, s.username, s.full_name as fullName
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
                    topicName: groupStudent.topicName,
                    lecturerTermId: groupStudent.lecturerTermId,
                    lecturerName: groupStudent.lecturerName,
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
                name: groupLecturerName.name,
                members,
                groupStudents,
            },
        });
    } catch (error) {
        console.log('🚀 ~ exports.getMemberFromGroupLecturer= ~ error:', error);
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
        console.log('🚀 ~ exports.searchGroupLecturerByName= ~ error:', error);
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
        console.log('🚀 ~ exports.countLecturerTermsByTermId= ~ error:', error);
        return Error.sendError(res, error);
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
        console.log('🚀 ~ exports.countGroupLecturersByLecturerId= ~ error:', error);
        return Error.sendError(res, error);
    }
};

exports.createGroupLecturerByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { termId, lecturers } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const countGr = (await GroupLecturer.count()) + 1;
        const name = checkTypeGroup(type.toUpperCase()) + ' ' + countGr;

        const groupLecturer = await GroupLecturer.create({
            name: name,
            term_id: termId,
            type: type.toUpperCase(),
        });

        lecturers.forEach(async (lecId) => {
            const lecturerTerm = await LecturerTerm.findOne({
                where: {
                    lecturer_id: lecId,
                    term_id: groupLecturer.term_id,
                },
            });

            GroupLecturerMember.create({
                group_lecturer_id: groupLecturer.id,
                lecturer_term_id: lecturerTerm.id,
            });
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo nhóm giảng viên mới thành công',
            groupLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Nhóm giảng viên không tồn tại!');
        }
        await groupLecturer.update(req.body);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật nhóm giảng viên thành công',
            groupLecturer,
        });
    } catch (error) {
        console.log(error);
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
        await groupLecturer.destroy();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá nhóm giảng viên thành công!',
        });
    } catch (error) {
        console.log(error);
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

        const query = `SELECT l.id, l.username, l.full_name as fullName, l.email, l.gender, l.degree, l.is_active, l.major_id 
        FROM lecturers l JOIN lecturer_terms lt ON l.id = lt.lecturer_id JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id JOIN group_lecturers gl 
        ON glm.group_lecturer_id = gl.id 
        WHERE gl.id = :id and l.id = :lecturer;
        `;

        const groupLecturerMembers = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: {
                id,
            },
        });

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
        console.log('🚀 ~ exports.getMemberFromGroupLecturer= ~ error:', error);
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
            await groupLecturer.destroy();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xóa giảng viên ra khỏi nhóm thành công',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.addMemberToGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { lecturerId } = req.body;
        const oldGr = await GroupLecturer.findByPk(id);
        const isExist = await isExistLecturerInGroup(lecturerId, id);
        if (isExist) {
            return Error.sendConflict(res, 'Giảng viên đã tham gia nhóm này');
        }
        const isFull = await isFullquantityOfGroup(id);

        if (isFull) {
            return Error.sendNotFound(res, 'Nhóm đã đủ số lượng thành viên tối đa');
        }

        if (!oldGr) {
            return Error.sendNotFound(res, 'Không có nhóm giảng viên này');
        }

        const oldLecturer = await LecturerTerm.findOne({
            where: { term_id: oldGr.term_id, lecturer_id: lecturerId },
        });

        if (!oldLecturer) {
            return Error.sendForbidden(res, 'Không tồn tại giảng viên trong học kì này');
        }

        const newMem = await GroupLecturerMember.create({
            group_lecturer_id: id,
            lecturer_term_id: oldLecturer.id,
        });

        const groupLecturerMember = await GroupLecturerMember.findByPk(newMem.id);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Thêm giảng viên thành công',
            groupLecturerMember,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const isExistLecturerInGroup = async (lecturerId, id) => {
    const query =
        'select l.id from lecturers l join lecturer_terms lt on lt.lecturer_id = l.id right join group_lecturer_members glm on glm.lecturer_term_id = lt.id where glm.group_lecturer_id = :id and l.id = :lecturerId';
    const member = await sequelize.query(query, {
        replacements: {
            id,
            lecturerId,
        },
        type: QueryTypes.SELECT,
    });

    if (member.length > 0) {
        return true;
    } else return false;
};

const isFullquantityOfGroup = async (id) => {
    const members = await GroupLecturerMember.findAll({
        where: {
            group_lecturer_id: id,
        },
    });
    if (members.length === 2) {
        return true;
    } else return false;
};
