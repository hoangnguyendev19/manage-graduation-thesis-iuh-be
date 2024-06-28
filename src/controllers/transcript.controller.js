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
const { sequelize } = require('../configs/connectDB');

exports.getTranscriptByTypeEvaluation = async (req, res) => {
    try {
        const { termId, type, studentId } = req.query;

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: studentId,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        const transcripts = await sequelize.query(
            `SELECT t.id, avg(t.score) as avgScore, e.type, l.full_name as lecturerName
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE t.student_term_id = :studentTermId AND e.type = :type
            GROUP BY t.id, e.type, l.full_name`,
            {
                replacements: {
                    studentTermId: studentTerm.id,
                    type,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

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

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kỳ!');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: studentId,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        const evaluation = await Evaluation.findByPk(evaluationId);

        if (score > evaluation.scoreMax) {
            return Error.sendBadRequest(res, 'Điểm không được lớn hơn điểm tối đa của đánh giá!');
        }

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
        const { score } = req.body;

        const transcript = await Transcript.findByPk(id);

        if (!transcript) {
            return Error.sendNotFound(res, 'Bảng điểm không tồn tại!');
        }

        const evaluation = await Evaluation.findByPk(transcript.evaluation_id);
        if (score > evaluation.scoreMax) {
            return Error.sendWarning(res, 'Điểm không được lớn hơn điểm tối đa của đánh giá!');
        }

        transcript.score = score;

        await transcript.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
