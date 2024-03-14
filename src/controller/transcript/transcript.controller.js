const { Transcript, StudentTerm, LecturerTerm } = require('../../schema/index');
const Error = require('../../handler/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');

exports.getTranscriptsByStudentId = async (req, res) => {
    try {
        const { termId, studentId } = req.query;
        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: studentId,
            },
        });
        if (!studentTerm) {
            return Error.sendNotFound(res, 'Student Term not found');
        }

        const transcripts = await Transcript.findAll({
            where: {
                student_term_id: studentTerm.id,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            transcripts,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTranscriptSummary = async (req, res) => {
    try {
        const { termId } = req.params;

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: req.user.id,
            },
        });

        const transcripts = await Transcript.findAll({
            where: {
                student_term_id: studentTerm.id,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            transcripts,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createTranscript = async (req, res) => {
    try {
        const { termId, studentId, score, evaluationId } = req.body;
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                term_id: termId,
                lecturer_id: req.user.id,
            },
        });

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: studentId,
            },
        });

        const transcript = await Transcript.create({
            lecturer_term_id: lecturerTerm.id,
            student_term_id: studentTerm.id,
            evaluation_id: evaluationId,
            score,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            transcript,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateTranscript = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, evaluationId } = req.body;

        const transcript = await Transcript.findByPk(id);
        if (score) {
            transcript.score = score;
        }
        if (evaluationId) {
            transcript.evaluation_id = evaluationId;
        }
        await transcript.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            transcript,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
