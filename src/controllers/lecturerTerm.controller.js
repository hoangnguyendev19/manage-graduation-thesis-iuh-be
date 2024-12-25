const { LecturerTerm, Lecturer, Term, Major } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/mysql.config');
const { validationResult } = require('express-validator');
const { checkDegree } = require('../helper/handler');
const logger = require('../configs/logger.config');

exports.importLecturerTerms = async (req, res) => {
    try {
        const { termId } = req.body;
        const term = await Term.findByPk(termId);

        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        const lecturers = await Lecturer.findAll({ where: { major_id: term.major_id } });

        for (const lecturer of lecturers) {
            const isExist = await LecturerTerm.findOne({
                where: {
                    term_id: termId,
                    lecturer_id: lecturer.id,
                },
            });

            if (!isExist) {
                await LecturerTerm.create({
                    term_id: termId,
                    lecturer_id: lecturer.id,
                });
            }
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Nhập danh sách giảng viên vào học kì thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.exportLecturerTerms = async (req, res) => {
    try {
        const { termId } = req.query;

        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kì!');
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        let lecturerTerms = await sequelize.query(
            `SELECT l.username as 'Mã GV', l.full_name as 'Tên GV',
                (SELECT COUNT(t.id)
                FROM topics t
                INNER JOIN lecturer_terms lt ON lt.id = t.lecturer_term_id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId) AS 'Số đề tài',
                (SELECT COUNT(gs.id)
                FROM group_students gs
                INNER JOIN topics t ON t.id = gs.topic_id
                INNER JOIN lecturer_terms lt ON lt.id = t.lecturer_term_id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId) AS 'Số nhóm hướng dẫn',
                (SELECT COUNT(glm.id)
                FROM group_lecturer_members glm
                INNER JOIN lecturer_terms lt ON lt.id = glm.lecturer_term_id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId) AS 'Số nhóm phân công'
            FROM lecturers l
            WHERE EXISTS (
                SELECT 1
                FROM lecturer_terms lt
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId
            )
            ORDER BY l.created_at DESC`,
            {
                replacements: {
                    termId: termId,
                },
                type: QueryTypes.SELECT,
            },
        );

        for (let i = 0; i < lecturerTerms.length; i++) {
            lecturerTerms[i]['STT'] = i + 1;
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách giảng viên trong học kì thành công!',
            lecturerTerms,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.exportLecturerAssigns = async (req, res) => {
    try {
        const { termId } = req.query;

        if (!termId) {
            return Error.sendWarning(res, 'Hãy chọn học kỳ!');
        }

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const lecturers = await sequelize.query(
            `SELECT lt.id, l.username as 'Mã nhân sự', l.full_name AS fullName, l.degree AS degree,
                (SELECT COUNT(t.id)
                FROM topics t
                INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId AND t.status = 'APPROVED') AS 'Số đề tài hướng dẫn KLTN',
                (SELECT COUNT(glm.id)
                FROM group_lecturers gl
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON lt.id = glm.lecturer_term_id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId AND gl.type = 'REVIEWER') AS 'Số đề tài chấm phản biện',
                (SELECT COUNT(glm.id)
                FROM group_lecturers gl
                INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON lt.id = glm.lecturer_term_id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId AND gl.type LIKE 'REPORT%') AS 'Số đề tài chấm Hội đồng/poster'
            FROM lecturers l
            INNER JOIN lecturer_terms lt ON l.id = lt.lecturer_id
            WHERE lt.term_id = :termId
            GROUP BY lt.id, l.id, l.username, l.full_name`,
            {
                replacements: { termId },
                type: QueryTypes.SELECT,
            },
        );

        for (let i = 0; i < lecturers.length; i++) {
            lecturers[i]['STT'] = i + 1;
            lecturers[i]['Họ tên'] = checkDegree(lecturers[i].degree, lecturers[i].fullName);
            lecturers[i]['Ghi chú'] = '';

            delete lecturers[i].id;
            delete lecturers[i].degree;
            delete lecturers[i].fullName;
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách giảng viên phân công thành công!',
            lecturers,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getLecturerTerms = async (req, res) => {
    try {
        const { termId } = req.query;

        // Check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        const lecturerTerms = await sequelize.query(
            `SELECT lt.id, l.id as lecturerId, l.username, l.full_name AS fullName, m.name AS majorName
            FROM lecturer_terms lt
            INNER JOIN lecturers l ON l.id = lt.lecturer_id
            INNER JOIN majors m ON m.id = l.major_id
            WHERE lt.term_id = :termId`,
            {
                replacements: {
                    termId: termId,
                    type: QueryTypes.SELECT,
                },
            },
        );

        let newLecturerTerms = [];

        for (let i = 0; i < lecturerTerms[0].length; i++) {
            const lt = lecturerTerms[0][i];

            const keywords = await sequelize.query(
                `SELECT DISTINCT t.keywords
                FROM topics t
                WHERE t.lecturer_term_id = :id`,
                {
                    replacements: {
                        id: lt.id,
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

            newLecturerTerms.push({
                ...lt,
                keywords: keywordsSorted,
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách giảng viên trong học kì thành công',
            lecturerTerms: newLecturerTerms,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.searchLecturerTerms = async (req, res) => {
    try {
        const { termId, limit = 10, page = 1, searchField, keywords, sort = 'ASC' } = req.query;

        // check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        const validLimit = _.toInteger(limit) > 0 ? _.toInteger(limit) : 10;
        const validPage = _.toInteger(page) > 0 ? _.toInteger(page) : 1;
        const offset = (validPage - 1) * validLimit;

        const allowedSorts = ['ASC', 'DESC'];
        if (!allowedSorts.includes(sort.toUpperCase())) {
            return Error.sendNotFound(res, `Sort order "${sort}" không hợp lệ!!`);
        }

        let searchQuery = '';
        if (searchField && keywords) {
            searchQuery = `AND l.${searchField} LIKE :keywords`;
        }

        const orderBy = sort ? `ORDER BY l.${searchField} ${sort}` : 'ORDER BY l.created_at DESC';

        const lecturerTerms = await sequelize.query(
            `SELECT lt.id, l.username, l.full_name AS fullName, m.name AS majorName,
                (SELECT COUNT(t.id)
                FROM topics t
                INNER JOIN lecturer_terms lt ON lt.id = t.lecturer_term_id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId AND t.status = 'APPROVED') AS totalTopics,
                (SELECT COUNT(gs.id)
                FROM group_students gs
                INNER JOIN topics t ON t.id = gs.topic_id
                INNER JOIN lecturer_terms lt ON lt.id = t.lecturer_term_id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId) AS totalGroupStudents,
                (SELECT COUNT(glm.id)
                FROM group_lecturer_members glm
                INNER JOIN lecturer_terms lt ON lt.id = glm.lecturer_term_id
                WHERE lt.lecturer_id = l.id AND lt.term_id = :termId) AS totalGroupLecturers
            FROM lecturer_terms lt
            INNER JOIN lecturers l ON l.id = lt.lecturer_id
            INNER JOIN majors m ON m.id = l.major_id
            WHERE lt.term_id = :termId
            ${searchQuery}
            GROUP BY lt.id, l.username, l.full_name, l.id
            ${orderBy}
            LIMIT :limit OFFSET :offset`,
            {
                replacements: {
                    termId: termId,
                    keywords: searchField === 'full_name' ? `%${keywords}` : `${keywords}%`,
                    limit: validLimit,
                    offset: offset,
                },
                type: QueryTypes.SELECT,
            },
        );

        const countResult = await sequelize.query(
            `SELECT COUNT(DISTINCT lt.id) AS total
            FROM lecturer_terms lt
            INNER JOIN lecturers l ON l.id = lt.lecturer_id
            WHERE lt.term_id = :termId
            ${searchQuery}`,
            {
                replacements: {
                    termId: termId,
                    keywords: searchField === 'full_name' ? `%${keywords}%` : `${keywords}%`,
                },
                type: QueryTypes.SELECT,
            },
        );

        const total = countResult[0].total;
        const totalPage = _.ceil(total / validLimit);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Tìm kiếm giảng viên hướng dẫn thành công',
            lecturerTerms,
            params: {
                page: validPage,
                limit: validLimit,
                totalPage,
            },
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getLecturerTermsToAdding = async (req, res) => {
    try {
        const { termId, majorId } = req.query;
        const query = `SELECT l.id AS lecturerId, l.full_name AS fullName,l.username as username,
        l.email,l.degree, m.name AS majorName
        FROM lecturers l
        LEFT JOIN lecturer_terms lt ON lt.lecturer_id = l.id AND lt.term_id = :termId
        LEFT JOIN majors m ON m.id = l.major_id
        WHERE 
        lt.lecturer_id IS NULL
        OR
        ( l.major_id  != :majorId AND  lt.lecturer_id IS NULL )`;

        const lecturerTerms = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: {
                majorId: majorId,
                termId: termId,
            },
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách giảng viên để thêm vào học kì thành công',
            lecturerTerms: lecturerTerms.map((lec) => ({
                ...lec,
                nameSelect: 'GV: ' + lec.fullName + ' - ' + lec.majorName,
            })),
            total: lecturerTerms.length,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getLecturerTermById = async (req, res) => {
    try {
        const { id } = req.params;

        const lecturerTerm = await sequelize.query(
            `SELECT lt.id,l.id as lecturerId, l.full_name as fullName, l.username, l.email, l.phone, l.gender, l.degree, m.name AS majorName
            FROM lecturer_terms lt
            INNER JOIN lecturers l ON l.id = lt.lecturer_id
            INNER JOIN majors m ON m.id = l.major_id
            WHERE lt.id = :id`,
            {
                replacements: {
                    id: id,
                },
                type: QueryTypes.SELECT,
            },
        );

        if (!lecturerTerm || lecturerTerm.length === 0) {
            return Error.sendNotFound(res, 'Giảng viên trong học kỳ không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin giảng viên trong học kỳ thành công!',
            lecturerTerm: lecturerTerm[0],
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.countLecturerTermsByTermId = async (req, res) => {
    try {
        const { termId } = req.query;
        const count = await LecturerTerm.count({
            where: { term_id: termId },
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng giảng viên trong học kì thành công!',
            count,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.createLecturerTerm = async (req, res) => {
    try {
        const { lecturerId, termId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const lecturer = await Lecturer.findByPk(lecturerId);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Giảng viên không hợp lệ.');
        }

        const isExist = await LecturerTerm.findOne({
            where: { term_id: termId, lecturer_id: lecturer.id },
        });

        if (isExist) {
            return Error.sendConflict(res, 'Đã tồn tại giảng viên này trong học kì.');
        }

        await LecturerTerm.create({ lecturer_id: lecturerId, term_id: termId });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Thêm giảng viên ${lecturer.fullName} thành công.`,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.deleteLecturerTerm = async (req, res) => {
    try {
        const { id } = req.params;

        const lecturerTerm = await LecturerTerm.findByPk(id);

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên trong học kì không tồn tại!');
        }

        await lecturerTerm.destroy();

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xóa giảng viên trong học kì thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};
