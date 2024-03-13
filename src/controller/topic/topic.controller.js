const { Topic } = require('../../schema/index');
const Error = require('../../handler/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');

exports.getTopics = async (req, res) => {
    try {
        const topics = await Topic.findAll();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            topics,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
