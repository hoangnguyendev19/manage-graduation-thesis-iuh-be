const { Topic, LecturerTerm, Lecturer, Major } = require('../../schema/index');
const Error = require('../../helper/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');

exports.getTopics = async (req, res) => {
    try {
        const { lecturerId, termId, majorId } = req.query;
        let topics = null;
        if (!lecturerId && termId && majorId) {
            const lecturers = await Lecturer.findAll({
                where: {
                    major_id: majorId,
                },
                attributes: ['id'],
            });

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
                            'fullName',
                            'avatarUrl',
                            'email',
                            'phoneNumber',
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
        } else if (lecturerId && termId && !majorId) {
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

exports.getTopicById = async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await Topic.findByPk(id);
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

exports.createTopic = async (req, res) => {
    try {
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: req.user.id,
            },
        });
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Lecturer Term not found');
        }

        const { name, description, quantityGroupMax, target, standardOutput, requireInput } =
            req.body;

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

exports.updateTopic = async (req, res) => {
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

exports.updateStatusTopic = async (req, res) => {
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

exports.deleteTopic = async (req, res) => {
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

// exports.chooseTopic = async (req, res) => {
//     try {
//         const { studentId, topicId } = req.body;
//         const topic = await Topic.findByPk(topicId);
//         if (!topic) {
//             return Error.sendNotFound(res, 'Topic not found');
//         }

//         const lecturerTerm = await LecturerTerm.findOne({
//             where: {
//                 id: topic.lecturer_term_id,
//             },
//         });

//         if (!lecturerTerm) {
//             return Error.sendNotFound(res, 'Lecturer Term not found');
//         }

//         const topicChoose = await Topic.findOne({
//             where: {
//                 [Op.and]: [
//                     {
//                         lecturer_term_id: lecturerTerm.id,
//                     },
//                     {
//                         status: 'APPROVED',
//                     },
//                 ],
//             },
//         });

//         if (!topicChoose) {
//             return Error.sendNotFound(res, 'Topic not found');
//         }

//         topicChoose.status = 'PENDING';
//         await topicChoose.save();

//         res.status(HTTP_STATUS.OK).json({
//             success: true,
//             message: 'Choose Topic Success',
//             topic: topicChoose,
//         });
//     } catch (error) {
//         console.log(error);
//         Error.sendError(res, error);
//     }
// };
