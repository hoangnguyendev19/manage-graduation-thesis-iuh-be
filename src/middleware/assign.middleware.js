const { includes } = require('lodash');
const { sequelize } = require('../configs/connectDB');
const { GroupLecturer, GroupLecturerMember, Assign } = require('../models');
const { QueryTypes } = require('sequelize');
const Error = require('../helper/errors');

const typeReport = (value) => {
    switch (value) {
        case 'REVIEWER':
            return 'Phản biện';
    }
};
const isExistLecturerSupportInGroupLecturer = async (req, res, next) => {
    try {
        const { type } = req.params;
        const { groupLecturerId, listGroupStudentId } = req.body;
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

        return isExistLecturerSupportInGroup === true
            ? Error.sendConflict(
                  res,
                  `Giảng viên hướng dẫn đề tài không được chấm ${typeReport(type.toUpperCase())}`,
              )
            : next();
    } catch (error) {
        return Error.sendError(res, error);
    }
};
const isExitGroupLecturerAndGroupStudent = async (req, res, next) => {
    try {
        const { type } = req.params;
        const { listGroupStudentId } = req.body;
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
        return flag === true
            ? Error.sendConflict(res, 'Nhóm sinh viên đã được phân công chấm điểm')
            : next();
    } catch (error) {
        return Error.sendError(res, error);
    }
};

module.exports = {
    isExistLecturerSupportInGroupLecturer,
    isExitGroupLecturerAndGroupStudent,
};
