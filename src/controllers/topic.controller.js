const { Topic, LecturerTerm, Lecturer, Major, GroupStudent } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Op } = require('sequelize');

//  get all topic -> theo chuyên ngành, học kì
const getTopics = async (req, res) => {
    try {
        const { lecturerId, termId, majorId } = req.query;
        let topics = null;

        //case 1
        if (!lecturerId && termId && majorId) {
            const lecturers = await Lecturer.findAll({
                where: {
                    major_id: majorId,
                },
                attributes: ['id'],
            });

            console.log('🚀 ~ getTopics ~ lecturers:', lecturers);

            const lecturerTerms = await LecturerTerm.findAll({
                where: {
                    term_id: termId,
                    lecturer_id: {
                        [Op.in]: lecturers.map((lecturer) => lecturer.id),
                    },
                },
            });

            if (lecturerTerms.length === 0) {
                return Error.sendNotFound(res, 'Lecturer Term not found');
            }

            topics = await Topic.findAll({
                where: {
                    lecturer_term_id: {
                        [Op.in]: lecturerTerms.map((lecturerTerm) => lecturerTerm.id),
                    },
                },
                attributes: { exclude: ['lecturer_term_id'] },

                include: {
                    model: LecturerTerm,
                    attributes: ['id'],
                    include: {
                        model: Lecturer,
                        attributes: [
                            'id',
                            'userName',
                            'fullName',
                            'avatar',
                            'email',
                            'phone',
                            'gender',
                            'degree',
                        ],
                        include: {
                            model: Major,
                            attributes: ['id', 'name'],
                            as: 'major',
                        },
                        as: 'lecturer',
                    },
                    as: 'lecturerTerm',
                },
            });

            for (let i = 0; i < topics.length; i++) {
                const topic = topics[i];
                const groupStudents = await GroupStudent.findAll({
                    where: {
                        topic_id: topic.id,
                    },
                });

                topic.dataValues.quantityGroup = groupStudents.length;
            }
        }
        //case 2
        else if (lecturerId && termId && !majorId) {
            const lecturerTerm = await LecturerTerm.findOne({
                where: {
                    lecturer_id: lecturerId,
                    term_id: termId,
                },
            });

            if (!lecturerTerm) {
                return Error.sendNotFound(res, 'Lecturer Term not found');
            }

            topics = await Topic.findAll({
                where: {
                    lecturer_term_id: lecturerTerm.id,
                },
            });
        }

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

const getTopicById = async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await Topic.findOne({
            where: {
                id,
            },
            include: {
                model: LecturerTerm,
                attributes: ['id'],
                include: {
                    model: Lecturer,
                    attributes: [
                        'id',
                        'userName',
                        'fullName',
                        'avatar',
                        'email',
                        'phone',
                        'gender',
                        'degree',
                    ],
                    include: {
                        model: Major,
                        attributes: ['id', 'name'],
                        as: 'major',
                    },
                    as: 'lecturer',
                },
                as: 'lecturerTerm',
            },
        });

        if (!topic) {
            return Error.sendNotFound(res, 'Topic not found');
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            topic,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const createTopic = async (req, res) => {
    const { name, description, quantityGroupMax, target, standardOutput, requireInput } = req.body;
    try {
        const lecturer_id = req.user.id;

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturer_id,
            },
        });
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Lecturer Term not found');
        }

        const topic = await Topic.create({
            name,
            description,
            quantityGroupMax,
            target,
            standardOutput,
            requireInput,
            lecturer_term_id: lecturerTerm.id,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            topic,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, quantityGroupMax, target, standardOutput, requireInput } =
            req.body;
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return Error.sendNotFound(res, 'Topic not found');
        }
        topic.name = name;
        topic.description = description;
        topic.quantityGroupMax = quantityGroupMax;
        topic.target = target;
        topic.standardOutput = standardOutput;
        topic.requireInput = requireInput;
        await topic.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            topic,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const updateStatusTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return Error.sendNotFound(res, 'Topic not found');
        }
        topic.status = status;
        await topic.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Status Success',
            topic,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return Error.sendNotFound(res, 'Topic not found');
        }
        await topic.destroy();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

module.exports = {
    getTopics,
    getTopicById,
    createTopic,
    updateTopic,
    updateStatusTopic,
    deleteTopic,
    // getAllTopics,
};
