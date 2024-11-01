const { Transcript, StudentTerm, LecturerTerm, Evaluation, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');

exports.getTranscriptByType = async (req, res) => {
    try {
        const { termId, type, groupStudentId } = req.query;

        // check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

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
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN student_terms st ON t.student_term_id = st.id
            INNER JOIN students s ON st.student_id = s.id
            WHERE e.type = :type AND t.student_term_id in (:studentTermIds) AND lt.term_id = :termId AND lt.lecturer_id = :lecturerId`,
            {
                replacements: {
                    studentTermIds,
                    type,
                    termId,
                    lecturerId: req.user.id,
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

        // check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

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

        // check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const transcripts = await sequelize.query(
            `SELECT st.student_id as id, e.type, sum(t.score) / sum(e.score_max) * 10 as avgScore
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN student_terms st ON t.student_term_id = st.id
            WHERE st.term_id = :termId AND st.student_id = :studentId
            GROUP BY st.student_id, e.type`,
            {
                replacements: {
                    termId,
                    studentId: req.user.id,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const advisor = transcripts.find((transcript) => transcript.type === 'ADVISOR');

        const reviewer = transcripts.find((transcript) => transcript.type === 'REVIEWER');

        const report = transcripts.find((transcript) => transcript.type === 'REPORT');

        const advisorScore = advisor ? Number(advisor.avgScore).toFixed(2) : 0;
        const reviewerScore = reviewer ? Number(reviewer.avgScore).toFixed(2) : 0;
        const reportScore = report ? Number(report.avgScore).toFixed(2) : 0;

        let totalAverageScore = 0;
        if (transcripts.length !== 0) {
            totalAverageScore = transcripts.reduce(
                (total, transcript) => total + transcript.avgScore,
                0,
            );
            totalAverageScore = Number(totalAverageScore / transcripts.length).toFixed(2);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bảng điểm tổng kết thành công!',
            transcript: {
                advisorScore,
                reviewerScore,
                reportScore,
                totalAverageScore,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTranscriptByStudentId = async (req, res) => {
    try {
        const { termId, type } = req.query;

        // Check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: term.id,
                student_id: req.user.id,
            },
        });

        let transcripts = await sequelize.query(
            `SELECT l.id, l.full_name as lecturerName, sum(t.score) / sum(e.score_max) * 10 as avgScore
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE t.student_term_id = :studentTermId AND e.type = :type
            GROUP BY l.id, l.full_name`,
            {
                replacements: {
                    studentTermId: studentTerm.id,
                    type,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        let totalAvgScore = 0;

        if (transcripts.length !== 0) {
            totalAvgScore = transcripts.reduce(
                (total, transcript) => total + transcript.avgScore,
                0,
            );
            totalAvgScore = Number(totalAvgScore.toFixed(2) / transcripts.length);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bảng điểm thành công!',
            transcript: {
                transcripts,
                totalAvgScore,
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

        // Check if term exist
        const term = await Term.findByPk(transcripts[0].termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // Check if lecturer exist in term
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                term_id: term.id,
                lecturer_id: req.user.id,
            },
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kỳ!');
        }

        for (const transcript of transcripts) {
            const { evaluationId, score, studentId } = transcript;

            // Check if student exist in term
            const studentTerm = await StudentTerm.findOne({
                where: {
                    term_id: term.id,
                    student_id: studentId,
                },
            });

            if (!studentTerm) {
                return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
            }

            // Check if evaluation exist
            const evaluation = await Evaluation.findByPk(evaluationId);
            if (!evaluation) {
                return Error.sendNotFound(res, 'Đánh giá không tồn tại!');
            }

            if (score > evaluation.scoreMax) {
                return Error.sendWarning(res, 'Điểm không được lớn hơn điểm tối đa của đánh giá!');
            }

            await Transcript.create({
                lecturer_term_id: lecturerTerm.id,
                student_term_id: studentTerm.id,
                evaluation_id: evaluation.id,
                score,
            });

            // Update status of student term with type 'FAIL_ADVISOR','FAIL_REVIEWER','FAIL_REPORT','PASS_ADVISOR','PASS_REVIEWER','PASS_REPORT'
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

        // Check if term exist
        const term = await Term.findByPk(transcripts[0].termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // Check if lecturer exist in term
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                term_id: term.id,
                lecturer_id: req.user.id,
            },
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kỳ!');
        }

        for (const trans of transcripts) {
            const { evaluationId, score, studentId } = trans;

            // Check if student exist in term
            const studentTerm = await StudentTerm.findOne({
                where: {
                    term_id: term.id,
                    student_id: studentId,
                },
            });

            if (!studentTerm) {
                return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
            }

            // Check if evaluation exist
            const evaluation = await Evaluation.findByPk(evaluationId);
            if (!evaluation) {
                return Error.sendNotFound(res, 'Đánh giá không tồn tại!');
            }

            const transcript = await Transcript.findOne({
                where: {
                    student_term_id: studentTerm.id,
                    evaluation_id: evaluation.id,
                    lecturer_term_id: lecturerTerm.id,
                },
            });

            if (!transcript) {
                return Error.sendNotFound(res, 'Bảng điểm không tồn tại!');
            }

            if (score > evaluation.scoreMax) {
                return Error.sendWarning(res, 'Điểm không được lớn hơn điểm tối đa của đánh giá!');
            }

            transcript.score = score;

            await transcript.save();

            // Update status of student term with type 'FAIL_ADVISOR','FAIL_REVIEWER','FAIL_REPORT','PASS_ADVISOR','PASS_REVIEWER','PASS_REPORT'
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

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật bảng điểm thành công!',
        });
    } catch (error) {
        console.log(error);
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

exports.getStatisticTranscript = async (req, res) => {
    try {
        const { termId } = req.query;

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // I want to statistic the number of students have the average score in the term. Calculate: (totalScore / totalScoreMax) * 10 and divide follow (0.0-5.0, 5.0-5.4, 5.5-5.9, 6.0-6.9, 7.0-7.9, 8.0-8.4, 8.5-8.9, 9.0-10) points and I want return the number of students in each range of points
        const statisticTranscripts = await sequelize.query(
            `SELECT 
            sum(case when avgScore >= 0 and avgScore < 5 then 1 else 0 end) as '0.0-4.9',
            sum(case when avgScore >= 5 and avgScore < 5.5 then 1 else 0 end) as '5.0-5.4',
            sum(case when avgScore >= 5.5 and avgScore < 6 then 1 else 0 end) as '5.5-5.9',
            sum(case when avgScore >= 6 and avgScore < 7 then 1 else 0 end) as '6.0-6.9',
            sum(case when avgScore >= 7 and avgScore < 8 then 1 else 0 end) as '7.0-7.9',
            sum(case when avgScore >= 8 and avgScore < 8.5 then 1 else 0 end) as '8.0-8.4',
            sum(case when avgScore >= 8.5 and avgScore < 9 then 1 else 0 end) as '8.5-8.9',
            sum(case when avgScore >= 9 and avgScore <= 10 then 1 else 0 end) as '9.0-10'
            FROM (
                SELECT st.student_id, (sum(t.score) / sum(e.score_max)) * 10 as avgScore
                FROM transcripts t
                INNER JOIN evaluations e ON t.evaluation_id = e.id
                INNER JOIN student_terms st ON t.student_term_id = st.id
                WHERE st.term_id = :termId
                GROUP BY st.student_id
            ) as temp`,
            {
                replacements: {
                    termId,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thống kê bảng điểm thành công!',
            statistic: statisticTranscripts[0],
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};
