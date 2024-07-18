const { GroupLecturer, LecturerTerm, GroupLecturerMember } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');
const { QueryTypes, where } = require('sequelize');
const _ = require('lodash');

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

        const query = `SELECT l.id, l.username, l.full_name as fullName, l.is_admin as isAdmin, l.is_active as isActive, l.major_id as majorId    
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
            message: 'Get Success',
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
        const { termId, type, limit, page } = req.query;
        let groupLecturers = null;
        let offset = (page - 1) * limit;

        if (termId && !type) {
            groupLecturers = await GroupLecturer.findAll({
                where: {
                    term_id: termId,
                },
            });
        }

        const query = `SELECT l.id, l.username, l.full_name as fullName, l.gender, m.name as majorName
        FROM lecturers l  JOIN lecturer_terms lt ON l.id = lt.lecturer_id JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id JOIN group_lecturers gl 
        ON glm.group_lecturer_id = gl.id JOIN majors m ON l.major_id = m.id
        WHERE gl.id = :id;
        `;

        groupLecturers = await GroupLecturer.findAll({
            where: {
                term_id: termId,
                type: type.toUpperCase(),
            },
            limit: parseInt(limit),
            offset,
        });

        const result = [];
        for (let i = 0; i < groupLecturers.length; i++) {
            let id = groupLecturers[i].id;
            const groupLecturerMembers = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: {
                    id,
                },
            });
            result.push({
                groupLecturerId: id,
                name: groupLecturers[i].name,
                type: groupLecturers[i].type,
                members: groupLecturerMembers,
            });
        }
        const total = await GroupLecturer.count();
        const totalPage = _.ceil(total / _.toInteger(limit));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupLecturers: result,
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

exports.getGroupLecturersByLecturerId = async (req, res) => {
    try {
        const { termId, lecturerId } = req.query;
        const { type } = req.params;
        let groupLecturers = null;
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: termId,
            },
            attributes: ['id'],
        });

        const query = `SELECT l.id, l.username, l.full_name as fullName, l.gender, m.name as majorName
        FROM lecturers l  JOIN lecturer_terms lt ON l.id = lt.lecturer_id JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id JOIN group_lecturers gl 
        ON glm.group_lecturer_id = gl.id JOIN majors m ON l.major_id = m.id
        WHERE gl.id = :id;
        `;
        const query2 = `select gr.id as id, gr.name, gr.type from group_lecturers gr 
        left join group_lecturer_members grm
        on gr.id = grm.group_lecturer_id
        where grm.lecturer_term_id = :lecturerTermId 
        and gr.type = :type
        `;
        groupLecturers = await sequelize.query(query2, {
            replacements: {
                lecturerTermId: lecturerTerm.id,
                type: type,
            },
            type: QueryTypes.SELECT,
            attributes: ['id', 'name', 'type'],
        });

        const result = [];
        for (let i = 0; i < groupLecturers.length; i++) {
            let id = groupLecturers[i].id;
            const groupLecturerMembers = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: {
                    id,
                },
            });
            result.push({
                groupLecturerId: id,
                name: groupLecturers[i].name,
                type: groupLecturers[i].type,
                members: groupLecturerMembers,
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupLecturers: result,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturerById = async (req, res) => {
    try {
        const { id } = req.params;
        const oldGr = await GroupLecturer.findByPk(id);
        if (!oldGr) {
            return Error.sendNotFound(res, 'Không có nhóm giảng viên này');
        }
        const query = `SELECT l.id, l.username, l.full_name as fullName, l.email, l.gender, l.degree, l.is_active as isActive, l.major_id as majoId, m.name as majorName
        FROM lecturers l JOIN lecturer_terms lt ON l.id = lt.lecturer_id JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id JOIN group_lecturers gl 
        ON glm.group_lecturer_id = gl.id JOIN majors m ON l.major_id = m.id
        WHERE gl.id = :id;
        `;
        const groupLecturerMembers = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: {
                id,
            },
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupLecturer: {
                groupLecturerId: oldGr.id,
                termId: oldGr.term_id,
                name: oldGr.name,
                typeGroup: oldGr.type,
                members: groupLecturerMembers,
            },
        });
    } catch (error) {
        console.log('🚀 ~ exports.getMemberFromGroupLecturer= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.createGroupLecturerByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { termId, lecturers } = req.body;

        const countGr = (await GroupLecturer.count()) + 1;
        const name = checkTypeGroup(type.toUpperCase()) + countGr;

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
            message: 'Tạo Nhóm giảng viên mới thành công',
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
            return Error.sendNotFound(res, 'Group Lecturer not found');
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
            return Error.sendNotFound(res, 'Group Lecturer not found');
        }
        await groupLecturer.destroy();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
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
            message: 'Get Success',
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
            return Error.sendNotFound(res, 'Nhóm giảng viên không hợp lệ');
        }

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: groupLecturer.term_id,
            },
        });
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Không tồn tại giảng viên trong học kì này');
        }
        const member = await GroupLecturerMember.findOne({
            where: {
                group_lecturer_id: id,
                lecturer_term_id: lecturerTerm.id,
            },
        });

        await member.destroy();

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
//Helper
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
