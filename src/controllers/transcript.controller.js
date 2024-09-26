const {
    Transcript,
    StudentTerm,
    LecturerTerm,
    Evaluation,
    Term,
    GroupLecturerMember,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');

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
                message: 'Lấy bảng điểm thành công!',
                transcripts: [],
            });
        }
        const studentTermIds = studentTerms.map((studentTerm) => studentTerm.id);
        const transcripts = await sequelize.query(
            `SELECT t.evaluation_id as evaluationId, e.name as evaluationName,
            e.score_max as scoreMax, t.id as transcriptId, t.score, s.id as studentId,
            s.username, s.full_name as fullName
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
            message: 'Lấy bảng điểm thành công!',
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
            message: 'Lấy bảng điểm thành công!',
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
            message: 'Lấy bảng điểm tổng kết thành công!',
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
            message: 'Lấy bảng điểm thành công!',
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
        //TODO: Check if term exist
        const term = await Term.findByPk(transcripts[0].termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }
        //TODO: Check if lecturer exist in term
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                term_id: term.id,
                lecturer_id: req.user.id,
            },
        });
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kỳ!');
        }
        //TODO: multi promise transcript
        const transcriptPromises = transcripts.map(async (transcript) => {
            const { evaluationId, score } = transcript;

            //TODO: check is exist student
            const studentTerm = await StudentTerm.findOne({
                where: {
                    term_id: term.id,
                    student_id: transcript.studentId,
                },
            });
            if (!studentTerm) {
                throw new Error('Sinh viên không tồn tại trong học kỳ!');
            }

            //TODO: check is exist evaluation
            const evaluation = await Evaluation.findByPk(evaluationId);
            if (!evaluation) {
                throw new Error('Đánh giá không tồn tại!');
            }

            if (score > evaluation.scoreMax) {
                throw new Error('Điểm không được lớn hơn điểm tối đa của đánh giá!');
            }
            await Transcript.create({
                lecturer_term_id: lecturerTerm.id,
                student_term_id: studentTerm.id,
                evaluation_id: evaluation.id,
                score,
            });
            return studentTerm;
        });

        //TODO: success multi create
        const studentTerms = await Promise.all(transcriptPromises);

        const evaluation = await Evaluation.findByPk(transcripts[0].evaluationId);

        //TODO: Update actions of students
        for (const studentTerm of studentTerms) {
            const transcriptsOfStudent = await sequelize.query(
                `SELECT st.id, e.type, (sum(t.score) / sum(e.score_max)) * 10 as avgScore
            FROM student_terms st
            INNER JOIN transcripts t ON st.id = t.student_term_id
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            WHERE st.id = :studentTermId AND e.type = :type
            GROUP BY st.id, e.type`,
                {
                    replacements: {
                        studentTermId: studentTerm.id,
                        type: evaluation.type,
                    },
                    type: sequelize.QueryTypes.SELECT,
                },
            );

            const totalScore = transcriptsOfStudent.reduce(
                (total, transcript) => total + transcript.avgScore,
                0,
            );

            if (totalScore >= 4) {
                switch (evaluation.type) {
                    case 'ADVISOR':
                        studentTerm.status = 'PASS_ADVISOR';
                        break;
                    case 'REVIEWER':
                        studentTerm.status = 'PASS_REVIEWER';
                        break;
                    case 'REPORT':
                        studentTerm.status = 'PASS_REPORT';
                        break;
                    default:
                        break;
                }
            } else {
                switch (evaluation.type) {
                    case 'ADVISOR':
                        studentTerm.status = 'FAIL_ADVISOR';
                        break;
                    case 'REVIEWER':
                        studentTerm.status = 'FAIL_REVIEWER';
                        break;
                    case 'REPORT':
                        studentTerm.status = 'FAIL_REPORT';
                        break;
                    default:
                        break;
                }
            }
            await studentTerm.save();
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo bảng điểm thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateTranscriptList = async (req, res) => {
    try {
        const { transcripts } = req.body;

        const term = await Term.findByPk(transcripts[0].termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                term_id: term.id,
                lecturer_id: req.user.id,
            },
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kỳ!');
        }

        const updatePromises = transcripts.map(async (transcript) => {
            const { evaluationId, score, studentId } = transcript;
            const studentTerm = await StudentTerm.findOne({
                where: {
                    term_id: term.id,
                    student_id: studentId,
                },
            });

            if (!studentTerm) {
                throw new Error(`Sinh viên ${studentId} không tồn tại trong học kỳ!`);
            }
            const evaluation = await Evaluation.findByPk(evaluationId);
            if (!evaluation) {
                throw new Error(`Đánh giá ${evaluationId} không tồn tại!`);
            }
            if (score > evaluation.scoreMax) {
                throw new Error('Điểm không được lớn hơn điểm tối đa của đánh giá!');
            }
            const existingTranscript = await Transcript.findOne({
                where: {
                    student_term_id: studentTerm.id,
                    evaluation_id: evaluation.id,
                    lecturer_term_id: lecturerTerm.id,
                },
            });

            if (!existingTranscript) {
                throw new Error('Bảng điểm không tồn tại!');
            }
            existingTranscript.score = score;
            await existingTranscript.save();

            return studentTerm;
        });
        const studentTerms = await Promise.all(updatePromises);

        const evaluationType = transcripts[0]?.evaluationType || '';

        for (const studentTerm of studentTerms) {
            const transcriptsOfStudent = await sequelize.query(
                `SELECT st.id, e.type, (sum(t.score) / sum(e.score_max)) * 10 as avgScore
                FROM student_terms st
                INNER JOIN transcripts t ON st.id = t.student_term_id
                INNER JOIN evaluations e ON t.evaluation_id = e.id
                WHERE st.id = :studentTermId AND e.type = :type
                GROUP BY st.id, e.type`,
                {
                    replacements: {
                        studentTermId: studentTerm.id,
                        type: evaluationType,
                    },
                    type: sequelize.QueryTypes.SELECT,
                },
            );

            const totalScore = transcriptsOfStudent.reduce(
                (total, transcript) => total + transcript.avgScore,
                0,
            );

            if (totalScore >= 4) {
                switch (evaluationType) {
                    case 'ADVISOR':
                        studentTerm.status = 'PASS_ADVISOR';
                        break;
                    case 'REVIEWER':
                        studentTerm.status = 'PASS_REVIEWER';
                        break;
                    case 'REPORT':
                        studentTerm.status = 'PASS_REPORT';
                        break;
                    default:
                        break;
                }
            } else {
                switch (evaluationType) {
                    case 'ADVISOR':
                        studentTerm.status = 'FAIL_ADVISOR';
                        break;
                    case 'REVIEWER':
                        studentTerm.status = 'FAIL_REVIEWER';
                        break;
                    case 'REPORT':
                        studentTerm.status = 'FAIL_REPORT';
                        break;
                    default:
                        break;
                }
            }

            await studentTerm.save();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật bảng điểm thành công!',
        });
    } catch (error) {
        console.error(error);
        Error.sendError(res, error);
    }
};


exports.getTranscriptGroupStudentByLecturerSupport = async (req, res) => {
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
            'select gr.id as groupStudentId, gr.name as groupStudentName, t.name as topicName from group_students gr join topics t on gr.topic_id = t.id where t.lecturer_term_id = :lecturerTermId';
        const groupStudents = await sequelize.query(query, {
            replacements: {
                lecturerTermId: lecturerTerm.id,
            },
            type: sequelize.QueryTypes.SELECT,
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công',
            groupStudents,
        });
    } catch (error) {
        return Error.sendError(res, error);
    }
};

exports.unTranscriptStudentsByType = async (req, res) => {
    try {
        const { type = 'ADVISOR' } = req.params;
        const { termId } = req.query;

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: req.user.id,
                term_id: termId,
            },
            attributes: ['id'],
        });

        let query = '';
        let groupStudents;

        if (type === 'ADVISOR') {
            query = `
                select gr.id as id,
                gr.name as name,
                gr.topic_id as topicId,
                t.name as topicName
                from group_students gr 
                join topics t on gr.topic_id = t.id 
                where t.lecturer_term_id = :lecturerTermId`;
            groupStudents = await sequelize.query(query, {
                replacements: {
                    lecturerTermId: lecturerTerm.id,
                },
                type: sequelize.QueryTypes.SELECT,
            });
        } else {
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
                    message: 'Lấy danh sách sinh viên thành công',
                    groupStudents: [],
                    totalRows: 0,
                });
            }

            const inGroupLecturerQuery = `where ass.group_lecturer_id in (${myIn.join(',')})`;
            query = `select gr.topic_id as topicId, gr.name as name, gr.id as id, t.name as topicName 
                        from group_students gr
                        join topics t
                        on gr.topic_id  = t.id
                        join assigns ass
                        on gr.id  = ass.group_student_id
                        ${inGroupLecturerQuery}
                        and ass.type = :type
                        `;
            groupStudents = await sequelize.query(query, {
                replacements: {
                    type: type,
                },
                type: sequelize.QueryTypes.SELECT,
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách nhóm sinh viên thành công',
            groupStudents,
            totalRows: groupStudents.length,
        });
    } catch (error) {
        Error.sendError(res, error);
        return Error.sendError(res, error);
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
            type: sequelize.QueryTypes.SELECT,
        });

        const myIn = groupStudents.map((gr) => `'${gr.id}'`);
        const inGroupQuery = `where stTerm.group_student_id in (${myIn.join(',')})`;

        const query2 = `select st.full_name as fullName, st.username, stTerm.group_student_id as groupStudentId,gr.name as groupStudentName, st.id as studentId
        from student_terms stTerm 
        inner join students st on st.id = stTerm.student_id
        left join group_students gr on gr.id = stTerm.group_student_id 
        ${inGroupQuery}`;

        const groupStudentMembers = await sequelize.query(query2, {
            type: sequelize.QueryTypes.SELECT,
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách thành viên nhóm sinh viên thành công',
            groupStudentMembers,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};
