const {
    Assign,
    GroupLecturer,
    LecturerTerm,
    GroupLecturerMember,
    GroupStudent,
    Topic,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Sequelize, Op } = require('sequelize');

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
        const { groupLecturerId, groupStudentId } = req.body;
        const currentGroupLecturer = await GroupLecturer.findByPk(groupLecturerId, {
            attributes: ['id'],
        });

        if (!currentGroupLecturer) {
            return Error.sendNotFound(res, 'Không tồn tại nhóm giảng viên này');
        }
        const newAssigner = await Assign.create({
            group_lecturer_id: groupLecturerId,
            type: type.toUpperCase(),
            group_student_id: groupStudentId,
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Phân ${currentGroupLecturer.name} chấm điểm nhóm sinh viên thành công`,
            assign: newAssigner,
        });
    } catch (error) {
        console.log('🚀 ~ createAssignByType ~ error:', error);
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

        const myNotIn = assigns.map((ass) => ass.group_student_id);
        const resultGroupStudent = await GroupStudent.findAll({
            where: {
                term_id: termId,
                id: {
                    [Op.notIn]: myNotIn,
                },
            },
            attributes: {
                exclude: ['term_id', 'updated_at', 'created_at', 'topic_id'],
            },
            include: {
                model: Topic,
                attributes: ['id', 'name'],
                as: 'topic',
            },
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách sinh viên chưa chấm thành công',
            groupStudent: resultGroupStudent,
        });
    } catch (error) {
        console.log('🚀 ~ getGroupStudentNoAssign ~ error:', error);
        Error.sendError(res, error);
    }
};

module.exports = {
    getAssigns,
    getAssignByType,
    getAssignById,
    getAssignByLecturerId,
    createAssignByType,
    getGroupStudentNoAssign,
};
