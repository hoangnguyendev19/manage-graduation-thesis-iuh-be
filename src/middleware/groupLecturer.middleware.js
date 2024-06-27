const { QueryTypes, where } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const Error = require('../helper/errors');
const { GroupLecturerMember } = require('../models');

const isExistGroupLecturer = async (req, res, next) => {
    try {
        const { type } = req.params;
        const { termId, lecturers } = req.body;

        const query =
            'select lt.lecturer_id as lecturerId from group_lecturer_members grm inner join group_lecturers gr on gr.id = grm.group_lecturer_id inner join lecturer_terms lt on lt.id = grm.lecturer_term_id  where gr.type = :type';
        const memberOfGroup = await sequelize.query(query, {
            replacements: { type: type.toUpperCase() },
            type: QueryTypes.SELECT,
        });
        const allExist = lecturers.every((lec) =>
            memberOfGroup.map((lec) => lec.lecturerId).includes(lec),
        );

        if (allExist) {
            Error.sendConflict(res, 'Nhóm giảng viên này đã được tạo');
        } else next();
    } catch (error) {
        return Error.sendError(res, error);
    }
};
const isExistLecturerInGroup = async (req, res, next) => {
    const { id } = req.params;
    const { lecturerId } = req.body;
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
        Error.sendConflict(res, 'Giảng viên đã tham gia nhóm này');
    } else next();
};
const quantityOfGroup = async (req, res, next) => {
    const { id } = req.params;
    const members = await GroupLecturerMember.findAll({
        where: {
            group_lecturer_id: id,
        },
    });
    if (members.length === 2) {
        Error.sendNotFound(res, 'Nhóm đã đủ số lượng thành viên tối đa');
    } else next();
};
module.exports = {
    isExistLecturerInGroup,
    quantityOfGroup,
    isExistGroupLecturer,
};
