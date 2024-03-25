const { Transcript, StudentTerm, LecturerTerm, Evaluation, Lecturer } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Op } = require('sequelize');

exports.getTranscriptByTypeEvaluation = async (req, res) => {
    try {
        const { termId, type } = req.query;
        const studentId = req.user.id;

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: studentId,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Student term not found');
        }

        const evaluation = await Evaluation.findOne({
            where: {
                type,
                term_id: termId,
            },
        });

        if (!evaluation) {
            return Error.sendNotFound(res, 'Evaluation not found');
        }

        const transcripts = await Transcript.findAll({
            where: {
                student_term_id: studentTerm.id,
                evaluation_id: evaluation.id,
            },
            attributes: ['id', 'score'],
            include: [
                {
                    model: LecturerTerm,
                    attributes: ['id'],
                    include: [
                        {
                            model: Lecturer,
                            attributes: ['fullName'],
                            as: 'lecturer',
                        },
                    ],
                    as: 'lecturerTerm',
                },
            ],
        });

        if (transcripts.length === 0) {
            return Error.sendNotFound(res, 'Transcript not found');
        }

        const totalScore = transcripts.reduce((total, transcript) => total + transcript.score, 0);
        const averageScore = (totalScore / transcripts.length).toFixed(2);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            transcript: {
                transcripts,
                averageScore,
                type,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTranscriptSummary = async (req, res) => {
    try {
        const { termId } = req.query;

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
