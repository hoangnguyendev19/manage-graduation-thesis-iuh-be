const {
    Transcript,
    StudentTerm,
    LecturerTerm,
    Evaluation,
    Lecturer,
    Achievement,
    GroupLecturerMember,
    Assign,
    GroupStudent,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Sequelize, QueryTypes, where } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const { SELECT } = require('sequelize/lib/query-types');

exports.getTranscriptByType = async (req, res) => {
    try {
        const { termId, type, groupStudentId } = req.query;

        const studentTerms = await StudentTerm.findAll({
            where: {
                term_id: termId,
                group_student_id: groupStudentId,
            },
        });

        if (studentTerms.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Get success',
                transcripts: [],
            });
        }

        const studentTermIds = studentTerms.map((studentTerm) => studentTerm.id);

        const transcripts = await sequelize.query(
            `SELECT t.evaluation_id as evaluationId, e.name as evaluationName, e.score_max as scoreMax, t.id as transcriptId, t.score, s.id as studentId, s.username, s.full_name as fullName
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN student_terms st ON t.student_term_id = st.id
            INNER JOIN students s ON st.student_id = s.id
            WHERE e.type = :type AND t.student_term_id in (:studentTermIds)`,
            {
                replacements: {
                    studentTermIds,
                    type,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const newTranscripts = transcripts.reduce((acc, trans) => {
            const {
                evaluationId,
                evaluationName,
                scoreMax,
                transcriptId,
                score,
                studentId,
                username,
                fullName,
            } = trans;

            if (!acc[evaluationId]) {
                acc[evaluationId] = {
                    evaluationId,
                    evaluationName,
                    scoreMax,
                    students: [],
                };
            }

            acc[evaluationId].students.push({
                transcriptId,
                score,
                studentId,
                username,
                fullName,
            });

            return acc;
        }, {});

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            transcripts: Object.values(newTranscripts),
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTranscriptByGroupStudent = async (req, res) => {
    try {
        const { termId, groupStudentId } = req.query;

        const transcripts = await sequelize.query(
            `SELECT s.id, s.username, s.full_name as fullName, e.type, (sum(t.score) / sum(e.score_max)) * 10 as avgScore
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN student_terms st ON t.student_term_id = st.id
            INNER JOIN students s ON st.student_id = s.id
            WHERE st.group_student_id = :groupStudentId AND st.term_id = :termId
            GROUP BY s.id, e.type`,
            {
                replacements: {
                    groupStudentId,
                    termId,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        // I want to fix the avgScore to 2 decimal places
        transcripts.forEach((transcript) => {
            transcript.avgScore = Number(transcript.avgScore.toFixed(2));
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
        const { termId } = req.query;

        const transcripts = await sequelize.query(
            `SELECT s.id, e.type, (sum(t.score) / sum(e.score_max)) * 10 as avgScore
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN student_terms st ON t.student_term_id = st.id
            INNER JOIN students s ON st.student_id = s.id
            WHERE st.term_id = :termId AND s.id = :studentId
            GROUP BY s.id, e.type`,
            {
                replacements: {
                    termId,
                    studentId: req.user.id,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        // I want to fix the avgScore to 2 decimal places
        transcripts.forEach((transcript) => {
            transcript.avgScore = Number(transcript.avgScore.toFixed(2));
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

exports.getTranscriptByStudent = async (req, res) => {
    try {
        const { termId, type } = req.query;

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: req.user.id,
            },
        });

        const transcripts = await sequelize.query(
            `SELECT t.id, t.score, l.full_name as lecturerName
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE t.student_term_id = :studentTermId AND e.type = :type
            GROUP BY t.id, l.full_name`,
            {
                replacements: {
                    studentTermId: studentTerm.id,
                    type,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        let avgScore = 0;

        if (transcripts.length !== 0) {
            // I want to calculate average score throught transcripts
            const total = transcripts.reduce((total, transcript) => total + transcript.score, 0);
            avgScore = Number((total / transcripts.length).toFixed(2));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            transcript: {
                transcripts,
                avgScore,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createTranscriptList = async (req, res) => {
    try {
        const { transcripts } = req.body;

        const transcriptPromises = transcripts.map(async (transcript) => {
            const { termId, studentId, score, evaluationId } = transcript;

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
                return Error.sendWarning(res, 'Điểm không được lớn hơn điểm tối đa của đánh giá!');
            }

            await Transcript.create({
                lecturer_term_id: lecturerTerm.id,
                student_term_id: studentTerm.id,
                evaluation_id: evaluation.id,
                score,
            });
        });

        await Promise.all(transcriptPromises);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateTranscriptList = async (req, res) => {
    try {
        const { transcripts } = req.body;

        const transcriptPromises = transcripts.map(async (trans) => {
            const { id, score } = trans;

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
        });

        await Promise.all(transcriptPromises);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.unTranscriptGroupStudentByLecturerSupport = async (req, res) => {
    try {
        const { termId } = req.query;
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: req.user.id,
                term_id: termId,
            },
            attributes: ['id'],
        });

        const query =
            'select gr.id as groupStudentId,gr.name as groupStudentName, t.name as topicName from group_students gr  join topics t on gr.topic_id = t.id where t.lecturer_term_id = :lecturerTermId';
        const groupStudents = await sequelize.query(query, {
            replacements: {
                lecturerTermId: lecturerTerm.id,
            },
            type: QueryTypes.SELECT,
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get success',
            groupStudents,
        });
    } catch (error) {
        return Error.sendError(res, error);
    }
};

exports.unTranscriptStudentsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { termId } = req.query;

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: req.user.id,
                term_id: termId,
            },
            attributes: ['id'],
        });

        const groupLecturers = await GroupLecturerMember.findAll({
            where: {
                lecturer_term_id: lecturerTerm.id,
            },
            attributes: ['group_lecturer_id'],
        });
        const myIn = groupLecturers.map((mem) => `'${mem.group_lecturer_id}'`);
        if (myIn.length < 1) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Get success',
                groupStudents: [],
                totalRows: 0,
            });
        }
        const inGroupLecturerQuery = `where ass.group_lecturer_id in (${myIn.join(',')})`;
        const query = `select grStudent.topic_id as topicId, grStudent.name as name, grStudent.id as id, t.name as topicName 
        from group_students grStudent
        join topics t
        on grStudent.topic_id  = t.id
        join assigns ass
        on grStudent.id  = ass.group_student_id
        ${inGroupLecturerQuery}
        and ass.type = :type
        `;

        const groupStudents = await sequelize.query(query, {
            type: SELECT,
            replacements: {
                type: type,
            },
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get success',
            groupStudents,
            totalRows: groupStudents.length,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

exports.getGroupStudentMemberToScoring = async (req, res) => {
    try {
        const { termId } = req.query;
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: req.user.id,
                term_id: termId,
            },
            attributes: ['id'],
        });
        const query = `select gr.id as id from group_students gr
            join topics t on gr.topic_id = t.id
            where t.lecturer_term_id = :lecturerTermId`;
        const groupStudents = await sequelize.query(query, {
            replacements: {
                lecturerTermId: lecturerTerm.id,
            },
            type: QueryTypes.SELECT,
        });
        const myIn = groupStudents.map((gr) => `'${gr.id}'`);
        const inGroupQuery = `where stTerm.group_student_id in (${myIn.join(',')})`;

        const query2 = `select 
        st.full_name as fullName, st.username, stTerm.group_student_id as groupStudentId,gr.name as groupStudentName,
        st.id as studentId 
        from student_terms stTerm 
        inner join students st on st.id = stTerm.student_id
        left join group_students gr on gr.id = stTerm.group_student_id 
        ${inGroupQuery}`;

        const groupStudentMembers = await sequelize.query(query2, {
            type: QueryTypes.SELECT,
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get success',
            groupStudentMembers,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};
