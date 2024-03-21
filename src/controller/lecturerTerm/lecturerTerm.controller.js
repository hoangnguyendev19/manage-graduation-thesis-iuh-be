const { LecturerTerm } = require('../../schema/index');
const Error = require('../../helper/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');

exports.getLecturerTerms = async (req, res) => {
    try {
        const { termId } = req.query;

        const lecturerTerms = await LecturerTerm.findAll({
            where: {
                term_id: termId,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            lecturerTerms,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createLecturerTerm = async (req, res) => {
    try {
        const { termId, lecturerId } = req.body;

        const lecturerTerm = await LecturerTerm.create({
            term_id: termId,
            lecturer_id: lecturerId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            lecturerTerm,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateRoleLecturerTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const lecturerTerm = await LecturerTerm.findByPk(id);
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Lecturer Term not found');
        }

        lecturerTerm.role = role;
        await lecturerTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            lecturerTerm,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteLecturerTerm = async (req, res) => {
    try {
        const { id } = req.params;

        const lecturerTerm = await LecturerTerm.findByPk(id);
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Lecturer Term not found');
        }

        await lecturerTerm.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
