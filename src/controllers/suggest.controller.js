const { Topic, LecturerTerm } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const axios = require('axios');

exports.suggestTopics = async (req, res) => {
    try {
        const { termId, message } = req.body;

        const topics = await Topic.findAll({
            attributes: [
                'id',
                'name',
                'description',
                'target',
                'expected_result',
                'standard_output',
                'require_input',
            ],
            include: [
                {
                    model: LecturerTerm,
                    attributes: [],
                    where: {
                        term_id: termId,
                    },
                    as: 'lecturerTerm',
                },
            ],
        });
        const newTopics = topics.map((topic) => topic.toJSON());

        // Send user input and topics to Python service
        const response = await axios.post(
            process.env.PYTHON_SERVER_URL + '/api/v1/suggest-topics',
            { message, topics: newTopics },
            { headers: { 'Content-Type': 'application/json' } },
        );

        const data = response.data.map((topic) => {
            return {
                id: topic.id,
                name: topic.name,
            };
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Suggest topics success',
            data,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
