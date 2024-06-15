const { Topic, LecturerTerm, Lecturer, Major, GroupStudent } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Op, where } = require('sequelize');
const xlsx = require('xlsx');
const _ = require('lodash');

//  get all topic -> theo chuyên ngành, học kì

const getTopicByParams = async (req, res) => {
    try {
        const { lecturerId, termId, majorId, limit, page } = req.query;
        let topics = null;
        let offset = (page - 1) * limit;
        //case 1
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
                offset: offset,
                limit: parseInt(limit),
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
                offset: offset,
                limit: parseInt(limit),
                where: {
                    lecturer_term_id: lecturerTerm.id,
                },
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            topics,
            params: {
                page: _.toInteger(page),
                limit: _.toInteger(limit),
                totalPage: _.ceil(topics.length / _.toInteger(limit)),
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

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
    const { termId } = req.query;
    console.log('🚀 ~ createTopic ~ termId:', termId);
    try {
        const lecturer_id = req.user.id;

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturer_id,
                term_id: termId,
            },
        });
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không hợp lệ trong học kì này');
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

//support
// const importTopic = async (req, res) => {
//     try {
//         const { majorId, termId } = req.body;
//         if (!req.file) {
//             return Error.sendWarning(res, 'Please upload a file');
//         }
//         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const jsonData = xlsx.utils.sheet_to_json(sheet);

//         const listIdTopic = [];

//         const quantityTopicInDb = await Topic.count();

//         for (const [index, topic] of jsonData.entries()) {
//             const id = index + quantityTopicInDb + 2;

//             const lecturer_id = topic['Mã giảng viên'];

//             const name = topic['Tên đề tài'];
//             const target = topic['MỤC TIÊU ĐỀ TÀI'];
//             const note = topic['DỰ KIẾN SẢN PHẨM NGHIÊN CỨU CỦA ĐỀ TÀI VÀ KHẢ NĂNG ỨNG DỤNG'];
//             const description = topic['Mô tả'];
//             const requireInput = topic['Yêu cầu đầu vào'];
//             const standardOutput = topic['Yêu cầu đầu ra (Output Standards)'];
//             const major_id = majorId;

//             if (!lecturer_id) {
//                 return Error.sendWarning(res, 'Mã giảng viên không được bỏ trống');
//             }

//             const isExistLecturer = await LecturerTerm.findOne({
//                 where: {
//                     lecturer_id: lecturer_id,
//                     term_id: termId,
//                 },
//             });

//             if (isExistLecturer) {
//                 listIdTopic.push(id);
//             }
//         }

//         console.log('🚀 ~ listIdTopic:', listIdTopic);

//         return res.status(HTTP_STATUS.OK).json({
//             success: true,
//             status: HTTP_STATUS.OK,
//             message: 'Import excel danh sách đề tài thành công!',
//         });
//     } catch (error) {
//         console.log(error);
//         Error.sendError(res, error);
//     }
// };

//
const importTopic = async (req, res) => {
    try {
        const { majorId, termId } = req.body;
        if (!req.file) {
            return Error.sendWarning(res, 'Vui lòng chọn file tải lên');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        const listIdTopic = [];

        const quantityTopicInDb = await Topic.count();

        for (const [index, topic] of jsonData.entries()) {
            const id = index + quantityTopicInDb + 1;
            const lecturer_id = topic['Mã giảng viên'];
            const name = topic['Tên đề tài'];
            const target = topic['MỤC TIÊU ĐỀ TÀI'];
            const note = topic['DỰ KIẾN SẢN PHẨM NGHIÊN CỨU CỦA ĐỀ TÀI VÀ KHẢ NĂNG ỨNG DỤNG'];
            const description = topic['Mô tả'];
            const requireInput = topic['Yêu cầu đầu vào'];
            const standardOutput = topic['Yêu cầu đầu ra (Output Standards)'];
            const major_id = majorId;

            if (!lecturer_id) {
                return Error.sendWarning(res, 'Mã giảng viên không được bỏ trống');
            }

            const isExistLecturer = await LecturerTerm.findOne({
                where: {
                    lecturer_id: lecturer_id,
                    term_id: termId,
                },
            });
            // have lecturer term
            if (isExistLecturer) {
                const rsTopic = await Topic.create({
                    id,
                    name,
                    description,
                    note,
                    target,
                    requireInput,
                    standardOutput,
                    lecturer_term_id: isExistLecturer.id,
                    quantityGroupMax: 5,
                });

                //add
                listIdTopic.push(id);
            } else {
                return Error.sendWarning(
                    res,
                    `Mã Giảng viên  ${lecturer_id} của đề tài không tồn tại trong học kì này. `,
                );
            }
        }
        // Create Topics
        const newTopics = await Topic.findAll({
            where: {
                id: {
                    [Op.in]: listIdTopic.map((id) => id),
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

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            status: HTTP_STATUS.OK,
            message: 'Import excel danh sách đề tài thành công!',
            topics: newTopics,
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
    getTopicByParams,
    importTopic,
};
