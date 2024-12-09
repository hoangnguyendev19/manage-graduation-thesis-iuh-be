const { Topic, LecturerTerm, Lecturer, Major, GroupLecturer, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { QueryTypes } = require('sequelize');
const xlsx = require('xlsx');
const _ = require('lodash');
const { sequelize } = require('../configs/connectDB');
const { validationResult } = require('express-validator');

exports.getTopicsOfSearch = async (req, res) => {
    try {
        const { termId, keywords = '', searchField, page = 1, limit = 10, sort } = req.query;

        // check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        const validLimit = _.toInteger(limit) > 0 ? _.toInteger(limit) : 10;
        const validPage = _.toInteger(page) > 0 ? _.toInteger(page) : 1;
        const offset = (validPage - 1) * validLimit;

        let searchQuery = '';
        let orderBy = '';
        let searchKey = `%${keywords}%`;

        if (searchField === 'lecturerName') {
            searchQuery = `AND l.full_name LIKE :keywords`;
            orderBy = `ORDER BY l.full_name ${sort.toUpperCase()}`;
        } else {
            searchQuery = `AND t.${searchField} LIKE :keywords`;
            orderBy = `ORDER BY t.${searchField} ${sort.toUpperCase()}`;
        }

        let topics = await sequelize.query(
            `SELECT t.id, t.key, t.name, t.status, t.quantity_group_max AS quantityGroupMax, l.full_name AS fullName, COUNT(gs.id) AS quantityGroup
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
                    limit: validLimit,
                    offset: offset,
                },
                type: QueryTypes.SELECT,
            },
        );

        const countResult = await sequelize.query(
            `SELECT COUNT(DISTINCT t.id) AS total
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
        const totalPage = _.ceil(total / validLimit);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách đề tài thành công!',
            topics,
            params: {
                page: validPage,
                limit: validLimit,
                totalPage,
            },
        });
    } catch (error) {
        console.log('🚀 ~ getTopicOfSearch ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getTopicByLecturer = async (req, res) => {
    try {
        const { termId } = req.query;
        const { lecturerId } = req.params;

        let topics = null;
        topics = await sequelize.query(
            `SELECT t.id, t.key, t.name, t.status, t.quantity_group_max as quantityGroupMax, COUNT(gs.id) as quantityGroup FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            LEFT JOIN group_students gs ON t.id = gs.topic_id
            WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId
            GROUP BY t.id, t.key, t.name, t.status, t.quantity_group_max`,
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

exports.getTopicsApprovedOfSearch = async (req, res) => {
    try {
        const { termId, keywords, searchField, page, limit, sort } = req.query;
        const offset = (page - 1) * limit;
        let topics = [];

        let searchQuery = '';
        let orderBy = '';
        let searchKey = '';

        const allowedFields = ['lecturerName', 'name'];
        const allowedSorts = ['ASC', 'DESC'];

        if (!allowedFields.includes(searchField)) {
            return Error.sendNotFound(res, `Điều kiện tìm kiếm ${searchField} không hợp lệ!`);
        }

        if (!allowedSorts.includes(sort.toUpperCase())) {
            return Error.sendNotFound(res, `Điều kiện sắp xếp ${searchField} không hợp lệ!`);
        }

        if (searchField === 'lecturerName') {
            searchQuery = `AND l.full_name LIKE :keywords `;
            orderBy = `ORDER BY l.full_name ${sort}`;
            searchKey = `%${keywords}`;
        } else {
            searchQuery = `AND t.${searchField} LIKE :keywords `;
            orderBy = `ORDER BY t.${searchField} ${sort}`;
            searchKey = `%${keywords}%`;
        }

        topics = await sequelize.query(
            `SELECT t.id, t.key, t.name, t.status, t.quantity_group_max as quantityGroupMax, l.full_name as fullName, COUNT(gs.id) as quantityGroup
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            LEFT JOIN group_students gs ON t.id = gs.topic_id
            WHERE lt.term_id = :termId AND t.status = :status ${searchQuery}
            GROUP BY t.id, t.key, t.name, t.status, t.quantity_group_max, l.full_name
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

exports.getTopicsApproved = async (req, res) => {
    try {
        const { termId } = req.query;

        const topics = await sequelize.query(
            `SELECT t.id, t.key, t.name, t.quantity_group_max as quantityGroupMax, l.full_name as fullName, COUNT(gs.id) as quantityGroup
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            LEFT JOIN group_students gs ON t.id = gs.topic_id
            WHERE lt.term_id = :termId AND t.status = :status 
            GROUP BY t.id, t.key, t.name, t.quantity_group_max, l.full_name
            ORDER BY t.name`,
            {
                replacements: {
                    termId,
                    status: 'APPROVED',
                },
                type: QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách đề tài thành công!',
            topics,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTopicsByGroupLecturerId = async (req, res) => {
    try {
        const { id } = req.params;

        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Nhóm giảng viên không tồn tại!');
        }

        const topics = await sequelize.query(
            `SELECT t.id, t.key, t.name FROM assigns a
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
            const { id, key, name } = topic;
            if (!acc[id]) {
                acc[id] = {
                    id,
                    key,
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

exports.getTopicById = async (req, res) => {
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
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
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

exports.countTopicsByTermId = async (req, res) => {
    try {
        const { termId } = req.query;

        const count = await Topic.count({
            include: {
                model: LecturerTerm,
                where: {
                    term_id: termId,
                },
                as: 'lecturerTerm',
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng đề tài trong học kỳ thành công!',
            count,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.countTopicsByLecturerId = async (req, res) => {
    try {
        const { termId } = req.query;

        const countRegisteredTopics = await sequelize.query(
            `SELECT COUNT(t.id) as count
            FROM topics t
            INNER JOIN group_students gs ON t.id = gs.topic_id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId`,
            {
                replacements: {
                    termId: termId,
                    lecturerId: req.user.id,
                },
                type: QueryTypes.SELECT,
            },
        );

        const countApprovedTopics = await sequelize.query(
            `SELECT COUNT(t.id) as count
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId AND t.status = 'APPROVED'`,
            {
                replacements: {
                    termId: termId,
                    lecturerId: req.user.id,
                },
                type: QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng đề tài của giảng viên học kỳ thành công!',
            countRegisteredTopics: countRegisteredTopics[0].count,
            countApprovedTopics: countApprovedTopics[0].count,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createTopic = async (req, res) => {
    try {
        const {
            name,
            description,
            quantityGroupMax,
            target,
            expectedResult,
            standardOutput,
            requireInput,
            keywords,
            lecturerId,
        } = req.body;

        const { termId } = req.query;

        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        // Check if lecturer is valid for this term
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: termId,
            },
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không hợp lệ trong học kì này');
        }

        // Check if the topic already exists
        const existedTopic = await Topic.findOne({
            where: {
                name,
                lecturer_term_id: lecturerTerm.id,
            },
        });

        if (existedTopic) {
            return Error.sendConflict(res, 'Đề tài đã tồn tại trong học kỳ này!');
        }

        // Fetch the last topic key in the term
        const lastTopic = await sequelize.query(
            `SELECT t.key FROM topics t
            LEFT JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId
            ORDER BY t.key DESC
            LIMIT 1`,
            {
                replacements: { termId },
                type: QueryTypes.SELECT,
            },
        );

        let key = '001';
        if (lastTopic.length > 0) {
            const currentKey = parseInt(lastTopic[0].key, 10) + 1;
            key = currentKey.toString().padStart(3, '0');
        }

        const topic = await Topic.create({
            key,
            name,
            description,
            quantityGroupMax,
            target,
            expectedResult,
            standardOutput,
            requireInput,
            keywords,
            lecturer_term_id: lecturerTerm.id,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo đề tài thành công!',
            topic,
        });
    } catch (error) {
        console.error(error);
        Error.sendError(res, error);
    }
};

exports.updateTopic = async (req, res) => {
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
            keywords,
        } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const topic = await Topic.findByPk(id);
        if (!topic) {
            return Error.sendNotFound(res, 'Đề tài không tồn tại!');
        }

        if (topic.status !== 'APPROVED') {
            topic.name = name;
            topic.status = 'PENDING';
            topic.note = null;
        }

        topic.description = description;
        topic.target = target;
        topic.expectedResult = expectedResult;
        topic.standardOutput = standardOutput;
        topic.requireInput = requireInput;
        topic.quantityGroupMax = quantityGroupMax;
        topic.keywords = keywords;

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

exports.updateQuantityGroupMax = async (req, res) => {
    try {
        const { termId } = req.query;
        const { quantityGroupMax } = req.body;

        const query = `UPDATE topics t
        JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
        SET t.quantity_group_max = :quantityGroupMax
        WHERE lt.term_id = :termId`;

        await sequelize.query(query, {
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

exports.importTopics = async (req, res) => {
    try {
        const { termId } = req.body;

        if (!req.file || !req.file.buffer) {
            return Error.sendWarning(res, 'Vui lòng chọn file tải lên');
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        let listTopic = [];

        for (const topic of jsonData) {
            if (
                !topic['Mã GV'] ||
                !topic['Tên GV'] ||
                !topic['Tên đề tài'] ||
                !topic['Mục tiêu đề tài'] ||
                !topic['Dự kiến sản phẩm nghiên cứu của đề tài và khả năng ứng dụng'] ||
                !topic['Mô tả'] ||
                !topic['Yêu cầu đầu vào'] ||
                !topic['Yêu cầu đầu ra'] ||
                !topic['Từ khóa']
            ) {
                return Error.sendWarning(
                    res,
                    'File không đúng định dạng! Bạn hãy kiểm tra lại tên cột trong file excel.',
                );
            }

            const username = topic['Mã GV'];
            const fullName = topic['Tên GV'].trim();
            const name = topic['Tên đề tài'].trim();
            const target = topic['Mục tiêu đề tài'].trim();
            const expectedResult =
                topic['Dự kiến sản phẩm nghiên cứu của đề tài và khả năng ứng dụng'].trim();
            const description = topic['Mô tả'].trim();
            const requireInput = topic['Yêu cầu đầu vào'].trim();
            const standardOutput = topic['Yêu cầu đầu ra'].trim();
            const keywords = topic['Từ khóa'].trim();

            const lecturer = await Lecturer.findOne({
                where: {
                    username,
                },
                attributes: ['id'],
            });

            if (!lecturer) {
                return Error.sendNotFound(
                    res,
                    `Giảng viên ${fullName} có mã ${username} không tồn tại.`,
                );
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
                    `Giảng viên ${fullName} có mã ${username} không tồn tại trong kỳ này.`,
                );
            }

            const existedTopic = await Topic.findOne({
                where: {
                    name,
                    lecturer_term_id: isExistLecturer.id,
                },
            });

            if (existedTopic) {
                return Error.sendConflict(res, `Tên đề tài ${name} đã tồn tại.`);
            }

            listTopic.push({
                username,
                name,
                target,
                expectedResult,
                description,
                requireInput,
                standardOutput,
                keywords,
                lecturer_term_id: isExistLecturer.id,
            });
        }

        // Get the last topic key for the term
        const oldTopic = await sequelize.query(
            `SELECT t.key FROM topics t
            LEFT JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId
            ORDER BY t.key DESC
            LIMIT 1`,
            { replacements: { termId }, type: QueryTypes.SELECT },
        );

        // Determine the next topic key
        let lastKey = oldTopic.length === 0 ? 0 : parseInt(oldTopic[0].key, 10);

        for (const [i, topic] of listTopic.entries()) {
            const newKey = (lastKey + i + 1).toString().padStart(3, '0');
            const {
                name,
                description,
                target,
                expectedResult,
                standardOutput,
                requireInput,
                keywords,
                lecturer_term_id,
            } = topic;

            // Create new topics
            await Topic.create({
                key: newKey,
                name,
                description,
                quantityGroupMax: 2,
                target,
                expectedResult,
                standardOutput,
                requireInput,
                keywords,
                lecturer_term_id,
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Import danh sách đề tài thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.exportTopics = async (req, res) => {
    try {
        const { termId } = req.query;

        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kì!');
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        // collumns: Mã GV, Tên GV, Tên đề tài, Mô tả, Mục tiêu đề tài, Dự kiến sản phẩm nghiên cứu của đề tài và khả năng ứng dụng, Yêu cầu đầu vào, Yêu cầu đầu ra, Từ khóa
        let topics = await sequelize.query(
            `SELECT l.username as 'Mã GV', l.full_name as 'Tên GV', t.name as 'Tên đề tài', t.description as 'Mô tả', t.target as 'Mục tiêu đề tài', t.expected_result as 'Dự kiến sản phẩm nghiên cứu của đề tài và khả năng ứng dụng', t.require_input as 'Yêu cầu đầu vào', t.standard_output as 'Yêu cầu đầu ra', t.keywords as 'Từ khóa'
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

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách đề tài thành công!',
            topics,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.exportTopicsByLecturerId = async (req, res) => {
    try {
        const { termId } = req.query;

        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kì!');
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        // collumns: Mã GV, Tên GV, Tên đề tài, Mô tả, Mục tiêu đề tài, Dự kiến sản phẩm nghiên cứu của đề tài và khả năng ứng dụng, Yêu cầu đầu vào, Yêu cầu đầu ra, Từ khóa
        let topics = await sequelize.query(
            `SELECT l.username as 'Mã GV', l.full_name as 'Tên GV', t.name as 'Tên đề tài', t.description as 'Mô tả', t.target as 'Mục tiêu đề tài', t.expected_result as 'Dự kiến sản phẩm nghiên cứu của đề tài và khả năng ứng dụng', t.require_input as 'Yêu cầu đầu vào', t.standard_output as 'Yêu cầu đầu ra', t.keywords as 'Từ khóa'
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId`,
            {
                replacements: {
                    termId,
                    lecturerId: req.user.id,
                },
                type: QueryTypes.SELECT,
            },
        );

        for (let i = 0; i < topics.length; i++) {
            topics[i]['STT'] = i + 1;
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách đề tài của giảng viên thành công!',
            topics,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importTopicsFromTermIdToSelectedTermId = async (req, res) => {
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
                    keywords: topic.keywords,
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

exports.updateStatusTopic = async (req, res) => {
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

exports.deleteTopic = async (req, res) => {
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

exports.getKeywords = async (req, res) => {
    try {
        const { termId } = req.query;

        const keywords = await sequelize.query(
            `SELECT DISTINCT t.keywords
            FROM topics t
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId`,
            {
                replacements: {
                    termId,
                },
                type: QueryTypes.SELECT,
            },
        );

        const keywordsArr = keywords.map((keyword) => keyword.keywords.split(', '));

        let newKeywordsArr = [];
        for (const keyword of keywordsArr) {
            newKeywordsArr = newKeywordsArr.concat(keyword);
        }

        const keywordsCount = _.countBy(newKeywordsArr);
        const keywordsSorted = Object.keys(keywordsCount).sort(
            (a, b) => keywordsCount[b] - keywordsCount[a],
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy từ khóa thành công!',
            keywords: keywordsSorted,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
