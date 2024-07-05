const { Assign, GroupLecturer, LecturerTerm, GroupLecturerMember } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Sequelize, QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
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
const getAssigns = async (req, res) => {
    try {
        const assigns = await Assign.findAll({
            attributes: {
                exclude: ['updated_at', 'created_at'],
            },
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get all success',
            assigns,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

const getAssignById = async (req, res) => {
    try {
        const { id } = req.params;
        const assigns = await Assign.findByPk(id, {
            attributes: {
                exclude: ['updated_at', 'created_at'],
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get assign success',
            assigns,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};
const getAssignByType = async (req, res) => {
    try {
        const { type } = req.params;
        const assigns = await Assign.findAll({
            where: {
                type: type.toUpperCase(),
            },
            attributes: {
                exclude: ['updated_at', 'created_at'],
            },
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Get assign by ${type} success`,
            assigns,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};
const createAssignByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { groupLecturerId, listGroupStudentId } = req.body;

        const isExistAssign = await isExitGroupLecturerAndGroupStudent(type, listGroupStudentId);

        if (isExistAssign) {
            return Error.sendConflict(res, 'Nhóm sinh viên đã được phân công chấm điểm');
        }
        if (type === 'reviewer' || type === 'report_poster') {
            const isExistLecturerSupport = await isExistLecturerSupportInGroupLecturer(
                groupLecturerId,
                listGroupStudentId,
            );

            if (isExistLecturerSupport) {
                return Error.sendConflict(
                    res,
                    `Giảng viên hướng dẫn Đề tài không được phân ${checkTypeGroup(
                        type.toUpperCase(),
                    )}`,
                );
            }
        }
        const currentGroupLecturer = await GroupLecturer.findByPk(groupLecturerId, {
            attributes: ['id', 'name'],
        });

        if (!currentGroupLecturer) {
            return Error.sendNotFound(res, 'Không tồn tại nhóm giảng viên này');
        }

        listGroupStudentId.map(async (groupStudentId) => {
            await Assign.create({
                group_lecturer_id: groupLecturerId,
                type: type.toUpperCase(),
                group_student_id: groupStudentId,
            });
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Phân ${currentGroupLecturer.name} chấm điểm nhóm sinh viên thành công`,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};
const updateAssignByType = async () => {};
const deleteAssign = async () => {};

const getAssignByLecturerId = async (req, res) => {
    try {
        const { lecturerId, type } = req.params;
        const { termId } = req.query;

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                term_id: termId,
                lecturer_id: lecturerId,
            },
        });

        const lecturerOfMemberGroup = await GroupLecturerMember.findAll({
            where: { lecturer_term_id: lecturerTerm.id },
        });

        const assignsByGroupLecturer = await Assign.findAll({
            where: {
                group_lecturer_id: {
                    [Sequelize.Op.in]: lecturerOfMemberGroup.map((mem) => mem.group_lecturer_id),
                },
                type: type.toUpperCase(),
            },
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Get success`,
            assigns: assignsByGroupLecturer,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

const getGroupStudentNoAssign = async (req, res) => {
    try {
        const { type } = req.params;
        const { termId } = req.query;
        const assigns = await Assign.findAll({
            attributes: ['group_student_id'],
            where: {
                type: type.toUpperCase(),
            },
        });
        const myNotIn = assigns.map((ass) => `'${ass.group_student_id}'`);
        const notInCondition = myNotIn.length > 0 ? `AND gs.id NOT IN (${myNotIn.join(',')})` : '';

        const groupStudentsQuery = `
        SELECT gs.id, gs.name,
                t.name AS topicName, 
                l.full_name AS fullName,
                lt.id AS lecturerTermId
                FROM group_students gs
                LEFT JOIN topics t ON gs.topic_id = t.id
                LEFT JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                LEFT JOIN lecturers l ON lt.lecturer_id = l.id
        WHERE gs.term_id = :termId ${notInCondition}`;

        const resultGroupStudent = await sequelize.query(groupStudentsQuery, {
            replacements: { termId },
            type: sequelize.QueryTypes.SELECT,
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách sinh viên chưa chấm thành công',
            groupStudent: resultGroupStudent,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};
const isExistLecturerSupportInGroupLecturer = async (groupLecturerId, listGroupStudentId) => {
    const query =
        'select t.lecturer_term_id as id from topics t inner join group_students gt on t.id = gt.topic_id where gt.id = :groupStudentId ';

    const membersOfGroup = await GroupLecturerMember.findAll({
        where: { group_lecturer_id: groupLecturerId },
    });

    let isExistLecturerSupportInGroup;
    for (i = 0; i < listGroupStudentId.length; i++) {
        let lecturerSupport = await sequelize.query(query, {
            replacements: {
                groupStudentId: `${listGroupStudentId[i]}`,
            },
            type: QueryTypes.SELECT,
        });

        isExistLecturerSupportInGroup =
            membersOfGroup
                .map((x) => x.lecturer_term_id)
                .filter((id) => id === lecturerSupport[0].id).length > 0;

        if (isExistLecturerSupportInGroup) break;
    }
    return isExistLecturerSupportInGroup;
};
const isExitGroupLecturerAndGroupStudent = async (type, listGroupStudentId) => {
    let flag = false;
    for (let i = 0; i < listGroupStudentId.length; i++) {
        const oldAssign = await Assign.findOne({
            where: {
                type: type.toUpperCase(),
                group_student_id: listGroupStudentId[i],
            },
        });
        flag = oldAssign ? true : false;
        if (flag) break;
    }
    return flag === true;
};

module.exports = {
    getAssigns,
    getAssignByType,
    getAssignById,
    getAssignByLecturerId,
    createAssignByType,
    getGroupStudentNoAssign,
};
