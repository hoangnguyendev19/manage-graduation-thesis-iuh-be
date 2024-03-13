const { groupStudent } = require('../../schema/index');
const Error = require('../../handler/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');

exports.getGroupStudents = async (req, res) => {
    try {
        const { termId, topicId } = req.query;
        let groupStudents = null;
        if (termId && !topicId) {
            groupStudents = await groupStudent.findAll({
                where: {
                    termId: termId,
                },
            });
        } else if (termId && topicId) {
            groupStudents = await groupStudent.findAll({
                where: {
                    termId: termId,
                    topicId: topicId,
                },
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupStudents,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
