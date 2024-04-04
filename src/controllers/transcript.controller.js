const {
    Transcript,
    StudentTerm,
    LecturerTerm,
    Evaluation,
    Lecturer,
    Achievement,
} = require('../models/index');
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

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Student term not found');
        }

        const achievements = await Achievement.findAll({
            where: {
                student_term_id: studentTerm.id,
            },
            attributes: ['id', 'bonusScore'],
        });

        const totalBonusScore = achievements.reduce(
            (total, achievement) => total + achievement.bonusScore,
            0,
        );

        const transcripts = await Transcript.findAll({
            where: {
                student_term_id: studentTerm.id,
            },
            attributes: ['id', 'score'],
            include: [
                {
                    model: Evaluation,
                    attributes: ['type'],
                    as: 'evaluation',
                },
            ],
        });

        // I want to calculate the average score of each type of evaluation
        const evaluationTypes = [
            ...new Set(transcripts.map((transcript) => transcript.evaluation.type)),
        ];
        const evaluationSummary = evaluationTypes.map((type) => {
            const evaluationTranscripts = transcripts.filter(
                (transcript) => transcript.evaluation.type === type,
            );
            const totalScore = evaluationTranscripts.reduce(
                (total, transcript) => total + transcript.score,
                0,
            );
            const averageScore = (totalScore / evaluationTranscripts.length).toFixed(2);
            return {
                type,
                averageScore,
            };
        });

        const advisor = evaluationSummary.find((evaluation) => evaluation.type === 'ADVISOR');
        const sessionHost = evaluationSummary.find(
            (evaluation) => evaluation.type === 'SESSION_HOST',
        );
        const reviewer = evaluationSummary.find((evaluation) => evaluation.type === 'REVIEWER');

        // I want to calculate the total average score of all evaluations
        const totalScore = transcripts.reduce((total, transcript) => total + transcript.score, 0);
        const totalAverageScore = (totalScore / transcripts.length).toFixed(2);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            transcript: {
                advisorScore: advisor ? Number(advisor.averageScore) : 0,
                sessionHostScore: sessionHost ? Number(sessionHost.averageScore) : 0,
                reviewerScore: reviewer ? Number(reviewer.averageScore) : 0,
                totalBonusScore: Number(totalBonusScore),
                totalAverageScore: Number(totalAverageScore),
            },
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
