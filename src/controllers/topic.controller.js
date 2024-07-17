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
                            'username',
                            'fullName',
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
        const { name, description, target, standardOutput, requireInput } = req.body;
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }
        topic.name = name;
        topic.description = description;
        topic.target = target;
        topic.standardOutput = standardOutput;
        topic.requireInput = requireInput;

        await topic.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thành công!',
            topic,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const updateQuantityGroupMax = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantityGroupMax } = req.body;
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }

        topic.quantityGroupMax = quantityGroupMax;
        await topic.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thành công!',
            topic,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const importTopics = async (req, res) => {
    try {
        const { termId, majorId } = req.body;
        if (!req.file) {
            return Error.sendWarning(res, 'Vui lòng chọn file tải lên');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        let listTopic = [];
        for (const topic of jsonData) {
            const username = topic['Mã giảng viên'];
            const name = topic['Tên đề tài'].trim();
            const target = topic['MỤC TIÊU ĐỀ TÀI'].trim();
            const note =
                topic['DỰ KIẾN SẢN PHẨM NGHIÊN CỨU CỦA ĐỀ TÀI VÀ KHẢ NĂNG ỨNG DỤNG'].trim();
            const description = topic['Mô tả'].trim();
            const requireInput = topic['Yêu cầu đầu vào'].trim();
            const standardOutput = topic['Yêu cầu đầu ra (Output Standards)'].trim();

            let topicToSaved = {
                username: username,
                name: name,
                note: note,
                target: target,
                description: description,
                requireInput: requireInput,
                standardOutput: standardOutput,
            };
            const lecturer = await Lecturer.findOne({
                where: {
                    username: username,
                },
                attributes: ['id'],
            });

            if (!lecturer) {
                return Error.sendNotFound(res, `Giảng viên có mã ${username} không tồn tại.`);
            }

            const isExistLecturer = await LecturerTerm.findOne({
                where: {
                    lecturer_id: lecturer.id,
                    term_id: termId,
                },
                attributes: ['id'],
            });

            if (!isExistLecturer) {
                return Error.sendNotFound(
                    res,
                    `Mã giảng viên ${username} không tồn tại trong kỳ này.`,
                );
            } else {
                topicToSaved.lecturerTermId = isExistLecturer.id;
                listTopic.push(topicToSaved);
            }
        }
        listTopic.map(
            async ({
                name,
                description,
                note,
                target,
                standardOutput,
                requireInput,
                lecturerTermId,
            }) => {
                await Topic.create({
                    name,
                    description,
                    quantityGroupMax: 5,
                    note,
                    target,
                    standardOutput,
                    requireInput,
                    lecturer_term_id: lecturerTermId,
                });
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Import danh sách đề tài thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const updateStatusTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }
        topic.status = status;
        topic.note = note;
        await topic.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật trạng thái thành công!',
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
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }
        await topic.destroy();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá thành công!',
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
    updateQuantityGroupMax,
    updateStatusTopic,
    deleteTopic,
    // getAllTopics,
    getTopicByParams,
    importTopics,
};
