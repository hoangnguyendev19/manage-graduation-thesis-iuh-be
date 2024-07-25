const { LecturerTerm, Lecturer, Major, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

exports.importLecturerTerms = async (req, res) => {
    try {
        const { termId } = req.body;

        const term = await Term.findByPk(termId);

        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại');
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
            message: 'Import lecturer terms success',
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

exports.getLecturerTermsToAdding = async (req, res) => {
    try {
        const { termId, majorId } = req.query;
        const query = `SELECT l.id AS lecturerId, l.full_name AS fullName, m.name AS majorName
                        FROM lecturers l
                        LEFT JOIN lecturer_terms lt ON lt.lecturer_id = l.id AND lt.term_id = :termId
                        LEFT JOIN majors m ON m.id = l.major_id
                        WHERE 
                        lt.lecturer_id IS NULL
                        OR
                        l.major_id  != :majorId
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
            message: 'Get success',
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

exports.createLecturerTerm = async (req, res) => {
    try {
        const { lecturerId, termId } = req.body;
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
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
                term_id: termId,
            },
            attributes: ['id'],
        });
        if (!lecturerTerm) {
            Error.sendError(res, 'Không tồn tại giảng viên này');
        }
        await lecturerTerm.destroy({ force: true });

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Xóa giảng viên ra khỏi học kì thành công',
        });
    } catch (error) {
        console.log('🚀 ~ exports.deleteLecturerTerm ~ error:', error);
        Error.sendError(res, error);
    }
};
