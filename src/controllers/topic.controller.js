const {
    Topic,
    LecturerTerm,
    Lecturer,
    Major,
    GroupStudent,
    GroupLecturer,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Op, QueryTypes } = require('sequelize');
const xlsx = require('xlsx');
const _ = require('lodash');
const { sequelize } = require('../configs/connectDB');

const getTopicOfSearch = async (req, res) => {
    try {
        const { termId, keywords, searchField } = req.query;
        let searchQuery = searchField ? `and ${searchField} LIKE :keywords` : '';

        const topics = await sequelize.query(
            `SELECT t.id, t.name, t.description, t.target, t.expected_result, t.standard_output, t.require_input, t.status, t.note, t.quantity_group_max, t.lecturer_term_id FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId ${searchQuery}`,
            {
                replacements: {
                    termId,
                    keywords: `%${keywords}%`,
                },
                type: QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get all success!',
            topics,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const getTopics = async (req, res) => {
    try {
        const { lecturerId, termId } = req.query;
        let topics = null;

        //case 1
        if (!lecturerId && termId) {
            const lecturers = await Lecturer.findAll({
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
        else if (lecturerId && termId) {
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

const getTopicsByGroupLecturerId = async (req, res) => {
    try {
        const { id } = req.params;
        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Nhóm giảng viên không tồn tại!');
        }

        const topics = await sequelize.query(
            `SELECT t.id, t.name FROM assigns a
            INNER JOIN group_students gs ON a.group_student_id = gs.id
            INNER JOIN topics t ON gs.topic_id = t.id
            WHERE a.group_lecturer_id = :id`,
            {
                replacements: {
                    id,
                },
                type: QueryTypes.SELECT,
            },
        );

        const newTopics = topics.reduce((acc, topic) => {
            const { id, name } = topic;
            if (!acc[id]) {
                acc[id] = {
                    id,
                    name,
                };
            }

            return acc;
        }, {});

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            topics: Object.values(newTopics),
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
    const {
        name,
        description,
        quantityGroupMax,
        target,
        expectedResult,
        standardOutput,
        requireInput,
    } = req.body;
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
            expectedResult,
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
        const { name, description, target, expectedResult, standardOutput, requireInput } =
            req.body;
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }
        topic.name = name;
        topic.description = description;
        topic.target = target;
        topic.expectedResult = expectedResult;
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
        const { termId } = req.body;
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
            const expectedResult =
                topic['DỰ KIẾN SẢN PHẨM NGHIÊN CỨU CỦA ĐỀ TÀI VÀ KHẢ NĂNG ỨNG DỤNG'].trim();
            const description = topic['Mô tả'].trim();
            const requireInput = topic['Yêu cầu đầu vào'].trim();
            const standardOutput = topic['Yêu cầu đầu ra (Output Standards)'].trim();

            let topicToSaved = {
                username: username,
                name: name,
                target: target,
                expectedResult: expectedResult,
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
                target,
                expectedResult,
                standardOutput,
                requireInput,
                lecturerTermId,
            }) => {
                await Topic.create({
                    name,
                    description,
                    quantityGroupMax: 5,
                    target,
                    expectedResult,
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

const importTopicsFromTermIdToSelectedTermId = async (req, res) => {
    try {
        const { termId, selectedTermId } = req.body;

        console.log(termId, selectedTermId);

        if (termId === selectedTermId) {
            return Error.sendWarning(res, 'Học kì được chọn phải khác học kỳ hiện tại!');
        }

        const lecturersSelected = await LecturerTerm.findAll({
            where: { term_id: selectedTermId },
            attributes: ['lecturer_id'],
        });

        if (!lecturersSelected.length) {
            return Error.sendNotFound(res, 'Không tìm thấy giảng viên trong học kì được chọn!');
        }

        const lecturers = await LecturerTerm.findAll({
            where: { term_id: termId },
            attributes: ['lecturer_id'],
        });

        if (!lecturers.length) {
            return Error.sendNotFound(res, 'Không tìm thấy giảng viên trong học kì hiện tại!');
        }

        const lecturersArr = lecturers.map((lecturer) => lecturer.lecturer_id);
        const lecturersSelectedArr = lecturersSelected.map((lecturer) => lecturer.lecturer_id);
        const newLecturersArr = lecturersArr.filter(
            (lecturer) => !lecturersSelectedArr.includes(lecturer),
        );

        const processLecturerTopics = async (lecturerId) => {
            const lecturerTerm = await LecturerTerm.findOne({
                where: { term_id: termId, lecturer_id: lecturerId },
            });

            const lecturerTermSelected = await LecturerTerm.findOne({
                where: { term_id: selectedTermId, lecturer_id: lecturerId },
            });

            const topics = await Topic.findAll({
                where: { lecturer_term_id: lecturerTerm.id },
            });

            for (const topic of topics) {
                await Topic.create({
                    name: topic.name,
                    description: topic.description,
                    quantityGroupMax: topic.quantityGroupMax,
                    target: topic.target,
                    expectedResult: topic.expectedResult,
                    standardOutput: topic.standardOutput,
                    requireInput: topic.requireInput,
                    lecturer_term_id: lecturerTermSelected.id,
                });
            }
        };

        const lecturersToProcess = newLecturersArr.length ? newLecturersArr : lecturersArr;
        for (const lecturerId of lecturersToProcess) {
            await processLecturerTopics(lecturerId);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Import danh sách đề tài thành công!',
        });
    } catch (error) {
        console.error(error);
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
    getTopicOfSearch,
    getTopics,
    getTopicsByGroupLecturerId,
    getTopicById,
    createTopic,
    updateTopic,
    updateQuantityGroupMax,
    updateStatusTopic,
    deleteTopic,
    importTopics,
    importTopicsFromTermIdToSelectedTermId,
};
