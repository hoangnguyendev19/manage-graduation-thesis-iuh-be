const {
    Transcript,
    StudentTerm,
    LecturerTerm,
    Evaluation,
    Term,
    TermDetail,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/mysql.config');
const { checkDegree, validateDate } = require('../helper/handler');

exports.getTranscriptByTypeEvaluation = async (req, res) => {
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
            `SELECT t.evaluation_id as evaluationId, e.key as evaluationKey, e.name as evaluationName,
            e.score_max as scoreMax, t.id as transcriptId, t.score, s.id as studentId,
            s.username, s.full_name as fullName, st.status
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
                evaluationKey,
                evaluationName,
                scoreMax,
                transcriptId,
                score,
                studentId,
                username,
                fullName,
                status,
            } = trans;

            if (!acc[evaluationId]) {
                acc[evaluationId] = {
                    evaluationId,
                    evaluationKey,
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
                status,
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

        const termDetail = await TermDetail.findOne({
            where: {
                term_id: term.id,
                name: 'PUBLIC_RESULT',
            },
        });

        // check if now is between start date and end date of term detail
        if (validateDate(termDetail.startDate, termDetail.endDate) === false) {
            return Error.sendWarning(res, 'Hiện tại chưa đến thời gian công bố kết quả!');
        }

        const transcripts = await sequelize.query(
            `SELECT st.id, e.type, (sum(t.score) / sum(e.score_max)) * 10 as avgScore
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN student_terms st ON t.student_term_id = st.id
            WHERE st.term_id = :termId AND st.student_id = :studentId
            GROUP BY st.id, e.type`,
            {
                replacements: {
                    termId,
                    studentId: req.user.id,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const result = await sequelize.query(
            `SELECT sum(bonus_score) as bonusScore
            FROM articles a
            INNER JOIN student_terms st ON a.student_term_id = st.id
            WHERE st.term_id = :termId AND st.student_id = :studentId
            GROUP BY a.student_term_id`,
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

        const advisorScore = Number(advisor?.avgScore.toFixed(2) || 0);
        const reviewerScore = Number(reviewer?.avgScore.toFixed(2) || 0);
        const reportScore = Number(report?.avgScore.toFixed(2) || 0);

        const bonusScore = result[0]?.bonusScore || 0;

        const totalAvgScore =
            Number(((advisorScore + reviewerScore + reportScore) / 3).toFixed(2)) + bonusScore;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bảng điểm tổng kết thành công!',
            transcript: {
                advisorScore,
                reviewerScore,
                reportScore,
                bonusScore,
                totalAvgScore,
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

        const termDetail = await TermDetail.findOne({
            where: {
                term_id: term.id,
                name: 'PUBLIC_RESULT',
            },
        });

        // check if now is between start date and end date of term detail
        if (validateDate(termDetail.startDate, termDetail.endDate) === false) {
            return Error.sendWarning(res, 'Hiện tại chưa đến thời gian công bố kết quả!');
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

exports.getTranscriptsByTypeAssign = async (req, res) => {
    try {
        const { termId, type = 'ADVISOR' } = req.query;

        // Check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const transcripts = [];

        if (type === 'ADVISOR') {
            let students = await sequelize.query(
                `SELECT s.id, st.id as studentTermId, s.username, s.full_name as fullName, st.is_admin as isAdmin, st.status, gs.id as groupStudentId, gs.name as groupName, gs.link, t.name as topicName, e.id as evaluationId, e.key, e.name as evaluationName, e.score_max as scoreMax, lt.id as lecturerTermId
                FROM students s
                INNER JOIN student_terms st ON s.id = st.student_id
                INNER JOIN group_students gs ON st.group_student_id = gs.id
                INNER JOIN topics t ON gs.topic_id = t.id
                INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                INNER JOIN evaluations e ON st.term_id = e.term_id
                WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId AND e.type = :type
                ORDER BY gs.name, s.full_name`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { termId, lecturerId: req.user.id, type },
                },
            );

            students = students.reduce((acc, student) => {
                const stu = acc.find((item) => item.id === student.id);

                if (!stu) {
                    acc.push({
                        id: student.id,
                        studentTermId: student.studentTermId,
                        username: student.username,
                        fullName: student.fullName,
                        isAdmin: student.isAdmin,
                        status: student.status,
                        groupStudentId: student.groupStudentId,
                        groupName: student.groupName,
                        link: student.link,
                        topicName: student.topicName,
                        lecturerTermId: student.lecturerTermId,
                        evaluations: [
                            {
                                id: student.evaluationId,
                                key: student.key,
                                name: student.evaluationName,
                                scoreMax: student.scoreMax,
                            },
                        ],
                    });
                } else {
                    stu.evaluations.push({
                        id: student.evaluationId,
                        key: student.key,
                        name: student.evaluationName,
                        scoreMax: student.scoreMax,
                    });
                }
                return acc;
            }, []);

            for (const student of students) {
                const newEvaluations = [];
                let isScored = false;
                for (const evaluation of student.evaluations) {
                    const trans = await sequelize.query(
                        `SELECT t.score
                        FROM transcripts t
                        WHERE t.student_term_id = :studentTermId AND t.lecturer_term_id = :lecturerTermId AND t.evaluation_id = :evaluationId`,
                        {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                studentTermId: student.studentTermId,
                                lecturerTermId: student.lecturerTermId,
                                evaluationId: evaluation.id,
                            },
                        },
                    );

                    if (trans.length !== 0) {
                        isScored = true;
                    }

                    newEvaluations.push({
                        ...evaluation,
                        score: trans.length !== 0 ? trans[0].score : 0,
                    });
                }

                transcripts.push({
                    ...student,
                    studentTermId: undefined,
                    lecturerTermId: undefined,
                    isScored,
                    evaluations: newEvaluations,
                });
            }
        } else {
            let students = await sequelize.query(
                `SELECT s.id, st.id as studentTermId, s.username, s.full_name as fullName, st.is_admin as isAdmin, st.status, gs.id as groupStudentId, gs.name as groupName, gs.link, t.name as topicName, lt.id as lecturerTermId
                FROM students s
                INNER JOIN student_terms st ON s.id = st.student_id
                INNER JOIN group_students gs ON st.group_student_id = gs.id
                INNER JOIN topics t ON gs.topic_id = t.id
                INNER JOIN assigns a ON gs.id = a.group_student_id
                INNER JOIN group_lecturer_members glm ON a.group_lecturer_id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId AND a.type = :type
                ORDER BY gs.name, s.full_name`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { termId, lecturerId: req.user.id, type },
                },
            );

            for (const student of students) {
                let evaluations = await sequelize.query(
                    `SELECT e.id, e.key, e.name, e.score_max as scoreMax
                    FROM evaluations e
                    WHERE e.type = :type`,
                    {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: { type: type.split('_')[0] },
                    },
                );

                let isScored = false;
                const newEvaluations = [];
                for (const evaluation of evaluations) {
                    const trans = await sequelize.query(
                        `SELECT t.score
                        FROM transcripts t
                        WHERE t.student_term_id = :studentTermId AND t.lecturer_term_id = :lecturerTermId AND t.evaluation_id = :evaluationId`,
                        {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                studentTermId: student.studentTermId,
                                lecturerTermId: student.lecturerTermId,
                                evaluationId: evaluation.id,
                            },
                        },
                    );

                    if (trans.length !== 0) {
                        isScored = true;
                    }

                    newEvaluations.push({
                        ...evaluation,
                        score: trans.length !== 0 ? trans[0].score : 0,
                    });
                }

                transcripts.push({
                    ...student,
                    studentTermId: undefined,
                    lecturerTermId: undefined,
                    isScored,
                    evaluations: newEvaluations,
                });
            }
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bảng điểm thành công!',
            transcripts,
        });
    } catch (error) {
        console.log('🚀 ~ getGroupStudentsByTypeAssign ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.exportTranscripts = async (req, res) => {
    try {
        const { termId, type } = req.query;

        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const transcripts = [];

        let students = await sequelize.query(
            `SELECT s.id, st.id as studentTermId, s.username, s.full_name as fullName, st.status, gs.name as groupName, gs.link, t.name as topicName, e.id as evaluationId, e.key, e.name as evaluationName, e.score_max as scoreMax
            FROM students s
            INNER JOIN student_terms st ON s.id = st.student_id
            INNER JOIN group_students gs ON st.group_student_id = gs.id
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN evaluations e ON st.term_id = e.term_id
            WHERE st.term_id = :termId AND e.type = :type
            ORDER BY gs.name, s.full_name`,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { termId, type },
            },
        );

        students = students.reduce((acc, student) => {
            const stu = acc.find((item) => item.id === student.id);

            if (!stu) {
                acc.push({
                    id: student.id,
                    studentTermId: student.studentTermId,
                    username: student.username,
                    fullName: student.fullName,
                    status: student.status,
                    groupName: student.groupName,
                    link: student.link,
                    topicName: student.topicName,
                    evaluations: [
                        {
                            id: student.evaluationId,
                            key: student.key,
                            name: student.evaluationName,
                            scoreMax: student.scoreMax,
                        },
                    ],
                });
            } else {
                stu.evaluations.push({
                    id: student.evaluationId,
                    key: student.key,
                    name: student.evaluationName,
                    scoreMax: student.scoreMax,
                });
            }
            return acc;
        }, []);

        for (const student of students) {
            const evaluations = [];
            for (const evaluation of student.evaluations) {
                const trans = await sequelize.query(
                    `SELECT t.id, t.score, lt.id as lecturerTermId, l.full_name as lecturerName, l.degree
                    FROM transcripts t
                    INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                    INNER JOIN lecturers l ON lt.lecturer_id = l.id
                    WHERE t.student_term_id = :studentTermId AND t.evaluation_id = :evaluationId
                    ORDER BY l.full_name`,
                    {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: {
                            studentTermId: student.studentTermId,
                            evaluationId: evaluation.id,
                        },
                    },
                );

                if (trans.length === 1) {
                    evaluations.push({
                        ...evaluation,
                        score: trans[0].score,
                        lecturerTermId: trans[0].lecturerTermId,
                        lecturerName: checkDegree(trans[0].degree, trans[0].lecturerName),
                    });
                } else if (trans.length === 2) {
                    evaluations.push({
                        ...evaluation,
                        score: trans[0].score,
                        lecturerTermId: trans[0].lecturerTermId,
                        lecturerName: checkDegree(trans[0].degree, trans[0].lecturerName),
                    });

                    evaluations.push({
                        ...evaluation,
                        score: trans[1].score,
                        lecturerTermId: trans[1].lecturerTermId,
                        lecturerName: checkDegree(trans[1].degree, trans[1].lecturerName),
                    });
                } else if (trans.length === 3) {
                    evaluations.push({
                        ...evaluation,
                        score: trans[0].score,
                        lecturerTermId: trans[0].lecturerTermId,
                        lecturerName: checkDegree(trans[0].degree, trans[0].lecturerName),
                    });

                    evaluations.push({
                        ...evaluation,
                        score: trans[1].score,
                        lecturerTermId: trans[1].lecturerTermId,
                        lecturerName: checkDegree(trans[1].degree, trans[1].lecturerName),
                    });
                    evaluations.push({
                        ...evaluation,
                        score: trans[2].score,
                        lecturerTermId: trans[2].lecturerTermId,
                        lecturerName: checkDegree(trans[2].degree, trans[2].lecturerName),
                    });
                } else {
                    evaluations.push({
                        ...evaluation,
                        score: 0,
                        lecturerTermId: '',
                        lecturerName: '',
                    });
                }
            }

            transcripts.push({
                id: student.id,
                username: student.username,
                fullName: student.fullName,
                status: student.status,
                groupName: student.groupName,
                link: student.link,
                topicName: student.topicName,
                evaluations,
            });
        }

        const newTrans = transcripts.reduce((acc, transcript) => {
            const { evaluations, ...rest } = transcript;

            evaluations.forEach((evaluation) => {
                acc.push({
                    ...rest,
                    lecturerTermId: evaluation.lecturerTermId,
                    lecturerName: evaluation.lecturerName,
                    evaluations: [
                        {
                            id: evaluation.id,
                            key: evaluation.key,
                            name: evaluation.name,
                            scoreMax: evaluation.scoreMax,
                            score: evaluation.score,
                        },
                    ],
                });
            });

            return acc;
        }, []);

        const result = [];
        newTrans.map((transcript) => {
            const trans = result.find(
                (item) =>
                    item.id === transcript.id && item.lecturerTermId === transcript.lecturerTermId,
            );

            if (!trans) {
                result.push(transcript);
            } else {
                result.forEach((item) => {
                    if (
                        item.id === transcript.id &&
                        item.lecturerTermId === transcript.lecturerTermId
                    ) {
                        item.evaluations.push(transcript.evaluations[0]);
                    }
                });
            }
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất bảng điểm thành công!',
            transcripts: result,
        });
    } catch (error) {
        Error.sendError(res, error);
    }
};

exports.exportAllTranscripts = async (req, res) => {
    try {
        const { termId } = req.query;

        // Check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const students = await sequelize.query(
            `SELECT st.id, s.username, s.full_name as fullName, st.status, gs.name as groupName, t.name as topicName, l.full_name as lecturerName, l.degree
            FROM students s
            INNER JOIN student_terms st ON s.id = st.student_id
            INNER JOIN group_students gs ON st.group_student_id = gs.id
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE st.term_id = :termId
            ORDER BY gs.name, s.full_name`,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { termId },
            },
        );

        const result = [];

        for (const student of students) {
            let transcripts = await sequelize.query(
                `SELECT lt.id, l.full_name as lecturerName, l.degree, e.type, sum(t.score) as totalScore
                FROM transcripts t
                INNER JOIN evaluations e ON t.evaluation_id = e.id
                INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE t.student_term_id = :studentTermId
                GROUP BY lt.id, l.full_name, l.degree, e.type
                ORDER BY l.full_name`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { studentTermId: student.id },
                },
            );

            const advisor = transcripts.find((transcript) => transcript.type === 'ADVISOR');
            const reviewers = transcripts.filter((transcript) => transcript.type === 'REVIEWER');
            const reports = transcripts.filter((transcript) => transcript.type === 'REPORT');

            result.push({
                id: student.id,
                username: student.username,
                fullName: student.fullName,
                status: student.status,
                groupName: student.groupName,
                topicName: student.topicName,
                GVHD: checkDegree(student.degree, student.lecturerName),
                GVPB1: reviewers[0]
                    ? checkDegree(reviewers[0].degree, reviewers[0].lecturerName)
                    : '',
                GVPB2: reviewers[1]
                    ? checkDegree(reviewers[1].degree, reviewers[1].lecturerName)
                    : '',
                GVHĐ1: reports[0] ? checkDegree(reports[0].degree, reports[0].lecturerName) : '',
                GVHĐ2: reports[1] ? checkDegree(reports[1].degree, reports[1].lecturerName) : '',
                GVHĐ3: reports[2] ? checkDegree(reports[2].degree, reports[2].lecturerName) : '',
                'Điểm GVHD': Number(advisor?.totalScore.toFixed(2)) || 0,
                'Điểm GVPB1': Number(reviewers[0]?.totalScore.toFixed(2)) || 0,
                'Điểm GVPB2': Number(reviewers[1]?.totalScore.toFixed(2)) || 0,
                'Điểm GVHĐ1': Number(reports[0]?.totalScore.toFixed(2)) || 0,
                'Điểm GVHĐ2': Number(reports[1]?.totalScore.toFixed(2)) || 0,
                'Điểm GVHĐ3': Number(reports[2]?.totalScore.toFixed(2)) || 0,
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất bảng điểm thành công!',
            students: result,
        });
    } catch (error) {
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
