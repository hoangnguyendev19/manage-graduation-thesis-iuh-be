const { Topic, LecturerTerm, Lecturer, Major, GroupLecturer, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { QueryTypes } = require('sequelize');
const xlsx = require('xlsx');
const _ = require('lodash');
const { sequelize } = require('../configs/connectDB');

const getTopicOfSearch = async (req, res) => {
    try {
        const { termId, keywords, searchField, page, limit, sort } = req.query;
        const offset = (page - 1) * limit;
        let topics = [];

        let searchQuery = '';
        let orderBy = '';
        let searchKey = '';

        const allowedFields = ['lecturerName', 'name'];
        const allowedSorts = ['ASC', 'DESC'];

        // Validate searchField and sort
        if (!allowedFields.includes(searchField)) {
            Error.sendNotFound(res, `Điều kiện tìm kiếm ${searchField} không hợp lệ!`);
        }

        if (!allowedSorts.includes(sort.toUpperCase())) {
            Error.sendNotFound(res, `Điều kiện sắp xếp ${searchField} không hợp lệ!`);
        }

        if (searchField === 'lecturerName') {
            searchQuery = ` AND l.full_name LIKE :keywords `;
            orderBy = `ORDER BY l.full_name ${sort}`;
            searchKey = `%${keywords}`;
        } else {
            searchQuery = `AND t.${searchField} LIKE :keywords `;
            orderBy = `ORDER BY t.${searchField} ${sort}`;
            searchKey = `%${keywords}%`;
        }

        topics = await sequelize.query(
            `SELECT t.id, t.name, t.status, t.quantity_group_max as quantityGroupMax, l.full_name as fullName, COUNT(gs.id) as quantityGroup
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            LEFT JOIN group_students gs ON t.id = gs.topic_id
            WHERE lt.term_id = :termId ${searchQuery}
            GROUP BY t.id, t.name, t.status, t.quantity_group_max, l.full_name
            ${orderBy}
            LIMIT :limit OFFSET :offset`,
            {
                replacements: {
                    termId,
                    keywords: searchKey,
                    limit: _.toInteger(limit),
                    offset: _.toInteger(offset),
                },
                type: QueryTypes.SELECT,
            },
        );

        const countResult = await sequelize.query(
            `SELECT COUNT(t.id) as total
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE lt.term_id = :termId ${searchQuery}`,
            {
                replacements: {
                    termId,
                    keywords: searchKey,
                },
                type: QueryTypes.SELECT,
            },
        );

        const total = countResult[0].total;

        const totalPage = _.ceil(total / _.toInteger(limit));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách đề tài thành công!',
            topics,
            params: {
                page: _.toInteger(page),
                limit: _.toInteger(limit),
                totalPage,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const getTopicByLecturer = async (req, res) => {
    try {
        const { termId } = req.query;
        const { lecturerId } = req.params;
        let topics = null;
        topics = await sequelize.query(
            `SELECT t.id, t.name, t.status, t.quantity_group_max as quantityGroupMax, l.full_name as fullName, COUNT(gs.id) as quantityGroup FROM topics t
                    INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                    INNER JOIN lecturers l ON lt.lecturer_id = l.id
                    LEFT JOIN group_students gs ON t.id = gs.topic_id
                    WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId
                    GROUP BY t.id, t.name, t.status, t.quantity_group_max, l.full_name`,
            {
                replacements: {
                    termId,
                    lecturerId,
                },
                type: QueryTypes.SELECT,
            },
        );
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

const getTopicApprovedOfSearch = async (req, res) => {
    try {
        const { termId, keywords, searchField, page, limit, sort } = req.query;
        const offset = (page - 1) * limit;
        let topics = [];

        let searchQuery = '';
        let orderBy = '';
        let searchKey = '';

        const allowedFields = ['lecturerName', 'name'];
        const allowedSorts = ['ASC', 'DESC'];

        // Validate searchField and sort
        if (!allowedFields.includes(searchField)) {
            return Error.sendNotFound(res, `Điều kiện tìm kiếm ${searchField} không hợp lệ!`);
        }

        if (!allowedSorts.includes(sort.toUpperCase())) {
            return Error.sendNotFound(res, `Điều kiện sắp xếp ${searchField} không hợp lệ!`);
        }

        if (searchField === 'lecturerName') {
            searchQuery = ` AND l.full_name LIKE :keywords `;
            orderBy = `ORDER BY l.full_name ${sort}`;
            searchKey = `%${keywords}`;
        } else {
            searchQuery = `AND t.${searchField} LIKE :keywords `;
            orderBy = `ORDER BY t.${searchField} ${sort}`;
            searchKey = `%${keywords}%`;
        }

        topics = await sequelize.query(
            `SELECT t.id, t.name, t.status, t.quantity_group_max as quantityGroupMax, l.full_name as fullName, COUNT(gs.id) as quantityGroup
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            LEFT JOIN group_students gs ON t.id = gs.topic_id
            WHERE lt.term_id = :termId AND t.status = :status ${searchQuery}
            GROUP BY t.id, t.name, t.status, t.quantity_group_max, l.full_name
            ${orderBy}
            LIMIT :limit OFFSET :offset`,
            {
                replacements: {
                    termId,
                    status: 'APPROVED',
                    keywords: searchKey,
                    limit: _.toInteger(limit),
                    offset: _.toInteger(offset),
                },
                type: QueryTypes.SELECT,
            },
        );

        const countResult = await sequelize.query(
            `SELECT COUNT(t.id) as total
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE lt.term_id = :termId AND t.status = :status ${searchQuery}`,
            {
                replacements: {
                    termId,
                    status: 'APPROVED',
                    keywords: searchKey,
                },
                type: QueryTypes.SELECT,
            },
        );

        const total = countResult[0].total;

        const totalPage = _.ceil(total / _.toInteger(limit));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách đề tài thành công!',
            topics,
            params: {
                page: _.toInteger(page),
                limit: _.toInteger(limit),
                totalPage,
            },
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
            message: 'Lấy danh sách đề tài thành công!',
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
            message: 'Lấy thông tin đề tài thành công!',
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

        const existedTopic = await Topic.findOne({
            where: {
                name,
                lecturer_term_id: lecturerTerm.id,
            },
        });

        if (existedTopic) {
            return Error.sendConflict(res, 'Tên đề tài đã tồn tại!');
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
            message: 'Tạo đề tài thành công!',
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
        const {
            name,
            description,
            target,
            expectedResult,
            standardOutput,
            quantityGroupMax,
            requireInput,
        } = req.body;
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

const updateQuantityGroupMax = async (req, res) => {
    try {
        const { termId } = req.query;
        const { quantityGroupMax } = req.body;

        const query = `
        UPDATE topics t
        JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
        SET t.quantity_group_max = :quantityGroupMax
        WHERE lt.term_id = :termId
        `;
        const rs = await sequelize.query(query, {
            type: QueryTypes.BULKUPDATE,
            replacements: {
                quantityGroupMax: quantityGroupMax,
                termId: termId,
            },
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật số lượng thành công!',
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
            const target = topic['Mục tiêu đề tài'].trim();
            const expectedResult =
                topic['Dự kiến sản phẩm nghiên cứu của đề tài và khả năng ứng dụng'].trim();
            const description = topic['Mô tả'].trim();
            const requireInput = topic['Yêu cầu đầu vào'].trim();
            const standardOutput = topic['Yêu cầu đầu ra'].trim();

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
            }

            const existedTopic = await Topic.findOne({
                where: {
                    name: name,
                    lecturer_term_id: isExistLecturer.id,
                },
            });

            if (existedTopic) {
                return Error.sendConflict(res, `Tên đề tài ${name} đã tồn tại.`);
            }

            topicToSaved.lecturerTermId = isExistLecturer.id;
            listTopic.push(topicToSaved);
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

const exportTopics = async (req, res) => {
    try {
        const { termId } = req.body;

        // check termId is provided
        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kì!');
        }

        // check termId is valid
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        // STT, Mã giảng viên, Tên giảng viên, Tên đề tài, Mô tả, Mục tiêu đề tài, Dự kiến sản phẩm nghiên cứu của đề tài và khả năng ứng dụng, Yêu cầu đầu vào, Yêu cầu đầu ra
        const topics = await sequelize.query(
            `SELECT l.username as 'Mã giảng viên', l.full_name as 'Tên giảng viên', t.name as 'Tên đề tài', t.description as 'Mô tả', t.target as 'MỤC TIÊU ĐỀ TÀI', t.expected_result as 'DỰ KIẾN SẢN PHẨM NGHIÊN CỨU CỦA ĐỀ TÀI VÀ KHẢ NĂNG ỨNG DỤNG', t.require_input as 'Yêu cầu đầu vào', t.standard_output as 'Yêu cầu đầu ra'
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE lt.term_id = :termId`,
            {
                replacements: {
                    termId,
                },
                type: QueryTypes.SELECT,
            },
        );

        for (let i = 0; i < topics.length; i++) {
            topics[i]['STT'] = i + 1;
        }

        const ws = xlsx.utils.json_to_sheet(topics);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Danh sách đề tài');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-de-tai.xlsx');

        res.status(HTTP_STATUS.OK).send(buffer);
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

const importTopicsFromTermIdToSelectedTermId = async (req, res) => {
    try {
        const { termId, selectedTermId } = req.body;

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
    getTopicByLecturer,
    getTopicApprovedOfSearch,
    getTopicsByGroupLecturerId,
    getTopicById,
    createTopic,
    updateTopic,
    updateQuantityGroupMax,
    updateStatusTopic,
    deleteTopic,
    importTopics,
    exportTopics,
    importTopicsFromTermIdToSelectedTermId,
};
