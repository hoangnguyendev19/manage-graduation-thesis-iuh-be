const { LecturerTerm, Lecturer, Major } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const _ = require('lodash');

exports.importLecturerTerms = async (req, res) => {
    try {
        const { termId, majorId } = req.body;

        const lecturers = await Lecturer.findAll({ where: { major_id: majorId } });
        await LecturerTerm.bulkCreate(
            lecturers.map((lecturer) => ({
                term_id: termId,
                lecturer_id: lecturer.id,
            })),
        );

        const newLecturers = await Lecturer.findAll({
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'major_id'] },
            include: [
                {
                    model: Major,
                    attributes: ['id', 'name'],
                    as: 'major',
                },
            ],
            offset: 0,
            limit: 10,
        });

        let totalPage = newLecturers.length;

        totalPage = _.ceil(totalPage / _.toInteger(10));
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import Success',
            lecturers: newLecturers,
            params: {
                page: 1,
                limit: _.toInteger(10),
                totalPage,
            },
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
        await lecturerTerm.destroy();

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Xóa giảng viên ra khỏi học kì thành công',
        });
    } catch (error) {
        console.log('🚀 ~ exports.deleteLecturerTerm ~ error:', error);
        Error.sendError(res, error);
    }
};
