const { GroupLecturer, LecturerTerm, GroupLecturerMember } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');
const { QueryTypes, where } = require('sequelize');

const checkTypeGroup = (value) => {
    switch (value) {
        case 'ADVISOR':
            return 'Nhóm chấm hướng dẫn ';
        case 'REVIEWER':
            return 'Nhóm chấm phản biện ';
        case 'SESSION_HOST':
            return 'Nhóm chấm báo cáo ';
    }
};

exports.getLecturerNoGroupByType = async (req, res) => {
    try {
        const { termId } = req.query;
        const { type } = req.params;
        const subQuery = `SELECT lt.id FROM lecturer_terms lt LEFT JOIN group_lecturer_members glm ON lt.id = glm.lecturer_term_id LEFT JOIN  group_lecturers gl ON gl.id  = glm.group_lecturer_id WHERE gl.type = '${type.toUpperCase()}' `;

        const query = `SELECT l.id, l.username, l.full_name as fullName, l.avatar, l.role, l.is_admin as isAdmin, l.is_active as isActive, l.major_id as majorId    
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
        const { termId, type } = req.query;
        let groupLecturers = null;
        if (termId && !type) {
            groupLecturers = await GroupLecturer.findAll({
                where: {
                    term_id: termId,
                },
            });
        }

        groupLecturers = await GroupLecturer.findAll({
            where: {
                term_id: termId,
                type: type.toUpperCase(),
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupLecturers,
            totalRows: groupLecturers.length,
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
        const query = `SELECT l.id, l.username, l.full_name as fullName, l.avatar, l.email, l.gender, l.degree, l.role, l.is_active as isActive, l.major_id as majoId, m.name as majorName
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
                type: oldGr.type,
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
        const { termId } = req.body;

        const countGr = (await GroupLecturer.count()) + 1;
        const name = checkTypeGroup(type.toUpperCase()) + countGr;

        const groupLecturer = await GroupLecturer.create({
            name: name,
            term_id: termId,
            type: type.toUpperCase(),
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
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
        const query = `SELECT l.id, l.username, l.full_name as fullName, l.avatar, l.email, l.gender, l.degree, l.role, l.is_active, l.major_id 
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
