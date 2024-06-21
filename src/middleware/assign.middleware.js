const { includes } = require('lodash');
const { sequelize } = require('../configs/connectDB');
const { GroupLecturer, GroupLecturerMember, Assign } = require('../models');
const { QueryTypes } = require('sequelize');
const Error = require('../helper/errors');

const typeReport = (value) => {
    switch (value) {
        case 'ADVISOR':
            return 'Phản biện';
    }
};
const isExistLecturerSupportInGroupLecturer = async (req, res, next) => {
    try {
        const { type } = req.params;
        const { groupLecturerId, groupStudentId } = req.body;
        const query =
            'select t.lecturer_term_id as id from topics t inner join group_students gt on t.id = gt.topic_id where gt.id = :groupStudentId ';

        const lecturerSupport = await sequelize.query(query, {
            replacements: {
                groupStudentId,
            },
            type: QueryTypes.SELECT,
        });

        const membersOfGroup = await GroupLecturerMember.findAll({
            where: { group_lecturer_id: groupLecturerId },
        });
        const isExistLecturerSupportInGroup =
            membersOfGroup
                .map((x) => x.lecturer_term_id)
                .filter((id) => id === lecturerSupport[0].id).length > 0;

        if (isExistLecturerSupportInGroup) {
            return Error.sendConflict(
                res,
                `Giảng viên hướng dẫn đề tài không được chấm ${typeReport(type.toUpperCase())}`,
            );
        } else next();
    } catch (error) {
        return Error.sendError(res, error);
    }
};
const isExitGroupLecturerAndGroupStudent = async (req, res, next) => {
    try {
        const { type } = req.params;
        const { groupStudentId } = req.body;
        const oldAssign = await Assign.findOne({
            where: {
                type_evaluation: type.toUpperCase(),
                group_student_id: groupStudentId,
            },
        });
        if (oldAssign) {
            return Error.sendConflict(res, 'Nhóm sinh viên đã được phân công chấm điểm');
        } else next();
    } catch (error) {
        return Error.sendError(res, error);
    }
};

module.exports = {
    isExistLecturerSupportInGroupLecturer,
    isExitGroupLecturerAndGroupStudent,
};
