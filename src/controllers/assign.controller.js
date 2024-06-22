const { Assign, GroupLecturer } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');

const getAssigns = async (req, res) => {
    try {
        const assigns = await Assign.findAll({});

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get all success',
            assigns,
        });
    } catch (error) {
        console.log('🚀 ~ getAssigns ~ error:', error);
        Error;
    }
};
const getAssignByType = async (req, res) => {
    try {
        const { type } = req.params;
        const assigns = await Assign.findAll({
            where: {
                type_evaluation: type.toUpperCase(),
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
        console.log('🚀 ~ createAssignByType ~ groupStudentId:', groupStudentId);

        const currentGroupLecturer = await GroupLecturer.findByPk(groupLecturerId);

        if (!currentGroupLecturer) {
            return Error.sendNotFound(res, 'Không tồn tại nhóm giảng viên này');
        }

        const newAssigner = await Assign.create({
            group_lecturer_id: groupLecturerId,
            typeEvaluation: type.toUpperCase(),
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
const getAssignByLecturerId = async () => {};

module.exports = {
    getAssigns,
    getAssignByType,
    createAssignByType,
};
