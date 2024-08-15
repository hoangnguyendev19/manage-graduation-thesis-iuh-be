const { LecturerTerm, Lecturer, Major, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const { validationResult } = require('express-validator');

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
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getLecturerTermsList = async (req, res) => {
    try {
        const { termId } = req.query;
        const lecturerTerms = await LecturerTerm.findAll({
            where: {
                term_id: termId,
            },
            attributes: {
                exclude: ['updated_at', 'created_at', 'lecturer_id', 'term_id'],
            },
            include: {
                attributes: ['username', 'fullName', 'degree', 'id'],
                model: Lecturer,
                as: 'lecturer',
            },
        });
        const count = lecturerTerms.length;
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách giảng viên trong học kì thành công',
            lecturerTerms,
            totalRows: count,
        });
    } catch (error) {
        console.log('🚀 ~ exports.getLecturersList= ~ error:', error);
        return Error.sendError(res, error);
    }
};

exports.searchLecturerTerms = async (req, res) => {
    try {
        const { termId, limit, page, searchField, keywords } = req.query;

        let replacements = {
            keywords: searchField === 'full_name' ? `%${keywords}` : `${keywords}%`,
            limit: _.toInteger(limit),
            termId: termId,
            offset: (page - 1) * limit,
        };

        let searchQuery = searchField
            ? `lt.term_id = :termId AND l.${searchField} like :keywords`
            : 'lt.term_id = :termId ';
        let initQuery = `SELECT l.id, l.username, l.full_name as fullName, l.phone, l.email, l.gender, l.degree, l.is_active as isActive, l.major_id as majorId, m.name as majorName
            FROM lecturers l
            LEFT JOIN majors m ON l.major_id = m.id
            RIGHT JOIN lecturer_terms lt ON lt.lecturer_id  = l.id
            WHERE  ${searchQuery}
            ORDER BY l.created_at DESC
            LIMIT :limit OFFSET :offset`;

        let countQuery = `
            SELECT COUNT(*) as count
            FROM lecturers l 
            LEFT JOIN majors m ON l.major_id = m.id
            LEFT JOIN lecturer_terms lt ON lt.lecturer_id  = l.id
            WHERE
            ${searchQuery}
            ORDER BY l.created_at DESC`;

        const lecturerTerms = await sequelize.query(initQuery, {
            replacements: replacements,
            type: QueryTypes.SELECT,
        });
        const countLec = await sequelize.query(countQuery, {
            replacements: replacements,
            type: QueryTypes.SELECT,
        });

        const total = countLec[0].count;
        const totalPage = _.ceil(total / _.toInteger(limit));

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Tìm kiếm giảng viên hướng dẫn thành công',
            lecturerTerms,
            params: {
                page: _.toInteger(page),
                limit: _.toInteger(limit),
                totalPage,
            },
        });
    } catch (error) {
        console.log('🚀 ~ exports.searchLecturerTerms= ~ error:', error);
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
                        ( l.major_id  != :majorId AND  lt.lecturer_id IS NULL )
                        `;

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
        console.log('🚀 ~ export.getLecturerTermsToAdding= ~ error:', error);
        return Error.sendError(res, error);
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
        console.log('🚀 ~ exports.countLecturerTermsByTermId= ~ error:', error);
        return Error.sendError(res, error);
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
        console.log('🚀 ~ exports.addLecturerTerm= ~ error:', error);
        return Error.sendError(res, error);
    }
};

exports.deleteLecturerTerm = async (req, res) => {
    const { lecturerId, termId } = req.query;
    try {
        console.log('vao');
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: termId,
            },
            attributes: ['id'],
        });
        if (lecturerTerm === null) {
            return Error.sendError(res, 'Không tồn tại giảng viên này');
        } else {
            const isDestroy = await lecturerTerm.destroy({ force: true });
            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Xóa giảng viên ra khỏi học kì thành công',
            });
        }
    } catch (error) {
        console.log('🚀 ~ exports.deleteLecturerTerm ~ error:', error);
        Error.sendError(res, error);
    }
};
