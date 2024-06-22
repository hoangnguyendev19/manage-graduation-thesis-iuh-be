const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const Error = require('../helper/errors');
const { GroupLecturerMember } = require('../models');

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
};
