const {
    Transcript,
    StudentTerm,
    LecturerTerm,
    Evaluation,
    Term,
    TermDetail,
    Comment,
    Article,
    GroupStudent,
} = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/mysql.config');
const { checkDegree, validateDate } = require('../helper/handler');
const xlsx = require('xlsx');
const logger = require('../configs/logger.config');

exports.getTranscriptByTypeEvaluation = async (req, res) => {
    try {
        const { termId, type, lecturerId } = req.query;

        // Check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const transcripts = [];

        if (type === 'ADVISOR') {
            let students = await sequelize.query(
                `SELECT s.id, st.id as studentTermId, s.username, s.full_name as fullName, gs.id as groupStudentId, gs.name as groupName, t.name as topicName, e.id as evaluationId, e.key, e.name as evaluationName, e.score_max as scoreMax, lt.id as lecturerTermId, l.full_name as lecturerName, l.degree
                FROM students s
                INNER JOIN student_terms st ON s.id = st.student_id
                INNER JOIN group_students gs ON st.group_student_id = gs.id
                INNER JOIN topics t ON gs.topic_id = t.id
                INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                INNER JOIN evaluations e ON st.term_id = e.term_id
                WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId AND e.type = :type
                ORDER BY gs.name, s.full_name`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { termId, lecturerId, type },
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
                        groupStudentId: student.groupStudentId,
                        groupName: student.groupName,
                        topicId: student.topicId,
                        topicName: student.topicName,
                        lecturerSupport: checkDegree(student.degree, student.lecturerName),
                        lecturerTermId: student.lecturerTermId,
                        lecturerName: student.lecturerName,
                        degree: student.degree,
                        position: 'MEMBER_ONE',
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

                    newEvaluations.push({
                        ...evaluation,
                        score: trans.length !== 0 ? trans[0].score : 0,
                    });
                }

                transcripts.push({
                    ...student,
                    studentTermId: undefined,
                    evaluations: newEvaluations,
                });
            }
        } else {
            let students = await sequelize.query(
                `SELECT s.id, st.id as studentTermId, s.username, s.full_name as fullName, gs.id as groupStudentId, gs.name as groupName, t.id as topicId, t.name as topicName, lt.id as lecturerTermId, l.full_name as lecturerName, l.degree, glm.position
                FROM students s
                INNER JOIN student_terms st ON s.id = st.student_id
                INNER JOIN group_students gs ON st.group_student_id = gs.id
                INNER JOIN topics t ON gs.topic_id = t.id
                INNER JOIN assigns a ON gs.id = a.group_student_id
                INNER JOIN group_lecturer_members glm ON a.group_lecturer_id = glm.group_lecturer_id
                INNER JOIN lecturer_terms lt ON glm.lecturer_term_id = lt.id
                INNER JOIN lecturers l ON lt.lecturer_id = l.id
                WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId AND a.type = :type
                ORDER BY gs.name, s.full_name`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { termId, lecturerId, type },
                },
            );

            for (const student of students) {
                const lecturerSupport = await sequelize.query(
                    `SELECT l.id, l.full_name as lecturerName, l.degree
                    FROM lecturers l
                    INNER JOIN lecturer_terms lt ON l.id = lt.lecturer_id
                    INNER JOIN topics t ON lt.id = t.lecturer_term_id
                    WHERE t.id = :topicId`,
                    {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: { topicId: student.topicId },
                    },
                );

                let evaluations = await sequelize.query(
                    `SELECT e.id, e.key, e.name, e.score_max as scoreMax
                    FROM evaluations e
                    WHERE e.type = :type`,
                    {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: { type: type.split('_')[0] },
                    },
                );

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

                    newEvaluations.push({
                        ...evaluation,
                        score: trans.length !== 0 ? trans[0].score : 0,
                    });
                }

                transcripts.push({
                    ...student,
                    studentTermId: undefined,
                    topicId: undefined,
                    lecturerSupport: checkDegree(
                        lecturerSupport[0].degree,
                        lecturerSupport[0].lecturerName,
                    ),
                    evaluations: newEvaluations,
                });
            }
        }

        const newTranscripts = await transcripts.reduce(async (accPromise, transcript) => {
            const acc = await accPromise;
            const groupStudent = acc.find(
                (item) => item.groupStudentId === transcript.groupStudentId,
            );

            if (!groupStudent) {
                const comment = await Comment.findOne({
                    where: {
                        group_student_id: transcript.groupStudentId,
                        lecturer_term_id: transcript.lecturerTermId,
                        type,
                    },
                });

                acc.push({
                    groupStudentId: transcript.groupStudentId,
                    groupName: transcript.groupName,
                    topicName: transcript.topicName,
                    lecturerSupport: transcript.lecturerSupport,
                    evaluatorName: checkDegree(transcript.degree, transcript.lecturerName),
                    position: transcript.position,
                    comment: comment ? comment.content : '',
                    students: [
                        {
                            id: transcript.id,
                            username: transcript.username,
                            fullName: transcript.fullName,
                            evaluations: transcript.evaluations,
                        },
                    ],
                });
            } else {
                groupStudent.students.push({
                    id: transcript.id,
                    username: transcript.username,
                    fullName: transcript.fullName,
                    evaluations: transcript.evaluations,
                });
            }
            return acc;
        }, Promise.resolve([]));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bảng điểm thành công!',
            transcripts: newTranscripts,
        });
    } catch (error) {
        logger.error(error);
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
        logger.error(error);
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

        let transcripts = await sequelize.query(
            `SELECT st.id, e.type, l.full_name as fullName, l.degree, sum(t.score) / sum(e.score_max) * 10 as avgScore 
            FROM transcripts t
            INNER JOIN evaluations e ON t.evaluation_id = e.id
            INNER JOIN student_terms st ON t.student_term_id = st.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            INNER JOIN lecturers l ON lt.lecturer_id = l.id
            WHERE st.term_id = :termId AND st.student_id = :studentId
            GROUP BY st.id, e.type, l.full_name, l.degree`,
            {
                replacements: {
                    termId,
                    studentId: req.user.id,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        transcripts = transcripts
            .map((transcript) => {
                return {
                    ...transcript,
                    fullName: checkDegree(transcript.degree, transcript.fullName),
                    degree: undefined,
                    avgScore: Number(transcript.avgScore.toFixed(2)),
                };
            })
            .sort((a, b) => {
                if (a.type === 'ADVISOR') {
                    return -1;
                }
                if (b.type === 'ADVISOR') {
                    return 1;
                }
                if (a.type === 'REVIEWER' && b.type === 'REPORT') {
                    return -1;
                }
                if (a.type === 'REPORT' && b.type === 'REVIEWER') {
                    return 1;
                }
                return 0;
            });

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

        const bonusScore = result[0]?.bonusScore || 0;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bảng điểm tổng kết thành công!',
            transcript: {
                transcripts,
                bonusScore,
            },
        });
    } catch (error) {
        logger.error(error);
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
        logger.error(error);
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
        logger.error(error);
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
        logger.error(error);
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
                `SELECT lt.id, l.full_name as lecturerName, l.degree, e.type, sum(t.score) as totalScore, sum(t.score) / sum(e.score_max) * 10 as avgScore
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

            const bonusScore = await Article.sum('bonus_score', {
                where: { student_term_id: student.id },
            });

            const advisor = transcripts.find((transcript) => transcript.type === 'ADVISOR');
            const reviewers = transcripts.filter((transcript) => transcript.type === 'REVIEWER');
            const reports = transcripts.filter((transcript) => transcript.type === 'REPORT');

            const avgAdvisor = Number((advisor?.avgScore || 0).toFixed(2));
            const avgReviewer1 = Number((reviewers[0]?.avgScore || 0).toFixed(2));
            const avgReviewer2 = Number((reviewers[1]?.avgScore || 0).toFixed(2));
            const avgReport1 = Number((reports[0]?.avgScore || 0).toFixed(2));
            const avgReport2 = Number((reports[1]?.avgScore || 0).toFixed(2));
            const avgReport3 = Number((reports[2]?.avgScore || 0).toFixed(2));

            const totalAvgScore = Number(
                (
                    (avgAdvisor +
                        avgReviewer1 +
                        avgReviewer2 +
                        avgReport1 +
                        avgReport2 +
                        avgReport3) /
                    (reports[2] ? 6 : 5)
                ).toFixed(2),
            );

            const evaluations = await sequelize.query(
                `SELECT e.id, e.key, e.type, e.score_max as scoreMax, t.score, t.lecturer_term_id as lecturerTermId
                FROM transcripts t
                INNER JOIN evaluations e ON t.evaluation_id = e.id
                WHERE t.student_term_id = :studentTermId
                ORDER BY e.key`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { studentTermId: student.id },
                },
            );

            const evaluationAdvisor = evaluations.filter(
                (evaluation) =>
                    evaluation.type === 'ADVISOR' && evaluation.lecturerTermId === advisor?.id,
            );

            const evaluationReviewer1 = evaluations.filter(
                (evaluation) =>
                    evaluation.type === 'REVIEWER' &&
                    evaluation.lecturerTermId === reviewers[0]?.id,
            );

            const evaluationReviewer2 = evaluations.filter(
                (evaluation) =>
                    evaluation.type === 'REVIEWER' &&
                    evaluation.lecturerTermId === reviewers[1]?.id,
            );

            const evaluationReport1 = evaluations.filter(
                (evaluation) =>
                    evaluation.type === 'REPORT' && evaluation.lecturerTermId === reports[0]?.id,
            );

            const evaluationReport2 = evaluations.filter(
                (evaluation) =>
                    evaluation.type === 'REPORT' && evaluation.lecturerTermId === reports[1]?.id,
            );

            const evaluationReport3 = evaluations.filter(
                (evaluation) =>
                    evaluation.type === 'REPORT' && evaluation.lecturerTermId === reports[2]?.id,
            );

            result.push({
                id: student.id,
                username: student.username,
                fullName: student.fullName,
                status: student.status,
                groupName: student.groupName,
                topicName: student.topicName,
                GVHD: checkDegree(student?.degree, student?.lecturerName),
                GVPB1: checkDegree(reviewers[0]?.degree, reviewers[0]?.lecturerName),
                GVPB2: checkDegree(reviewers[1]?.degree, reviewers[1]?.lecturerName),
                GVHĐ1: checkDegree(reports[0]?.degree, reports[0]?.lecturerName),
                GVHĐ2: checkDegree(reports[1]?.degree, reports[1]?.lecturerName),
                GVHĐ3: checkDegree(reports[2]?.degree, reports[2]?.lecturerName),
                evaluationAdvisor,
                'Tổng điểm GVHD': advisor?.totalScore || 0,
                evaluationReviewer1,
                'Tổng điểm GVPB1': reviewers[0]?.totalScore || 0,
                evaluationReviewer2,
                'Tổng điểm GVPB2': reviewers[1]?.totalScore || 0,
                evaluationReport1,
                'Tổng điểm GVHĐ1': reports[0]?.totalScore || 0,
                evaluationReport2,
                'Tổng điểm GVHĐ2': reports[1]?.totalScore || 0,
                evaluationReport3,
                'Tổng điểm GVHĐ3': reports[2]?.totalScore || 0,
                'Điểm TB GVHD': avgAdvisor,
                'Điểm TB GVPB1': avgReviewer1,
                'Điểm TB GVPB2': avgReviewer2,
                'Điểm TB GVHĐ1': avgReport1,
                'Điểm TB GVHĐ2': avgReport2,
                'Điểm TB GVHĐ3': avgReport3,
                'Điểm TB': totalAvgScore,
                'Điểm Cộng': bonusScore || 0,
                'Tổng Điểm':
                    Number(totalAvgScore + (bonusScore || 0).toFixed(2)) > 10
                        ? 10
                        : Number(totalAvgScore + (bonusScore || 0).toFixed(2)),
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất bảng điểm thành công!',
            students: result,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.importTranscripts = async (req, res) => {
    try {
        const { termId, type } = req.body;

        // check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kì không tồn tại!');
        }

        const evaluations = await Evaluation.findAll({
            attributes: ['id', 'key', 'scoreMax'],
            where: {
                term_id: term.id,
                type: type.split('_')[0],
            },
        });

        if (evaluations.length === 0) {
            return Error.sendNotFound(
                res,
                'Tiêu chí đánh giá của loại này trong học kì này chưa được thêm!',
            );
        }

        if (!req.file || !req.file.buffer) {
            return Error.sendWarning(res, 'Vui lòng chọn file tải lên');
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        for (const data of jsonData) {
            if (!data['Mã nhóm']) {
                return Error.sendWarning(
                    res,
                    `Tên cột Mã nhóm không đúng định dạng hoặc dòng dữ liệu thứ ${jsonData.indexOf(data) + 2} chứa giá trị rỗng của tên cột đó (nếu tên cột là dòng thứ 1 của file excel).`,
                );
            }

            if (!data['Mã sinh viên']) {
                return Error.sendWarning(
                    res,
                    `Tên cột Mã sinh viên không đúng định dạng hoặc dòng dữ liệu thứ ${jsonData.indexOf(data) + 2} chứa giá trị rỗng của tên cột đó (nếu tên cột là dòng thứ 1 của file excel).`,
                );
            }

            const studentTerm = await sequelize.query(
                `SELECT st.id
                FROM student_terms st
                INNER JOIN students s ON s.id = st.student_id
                WHERE st.term_id = :termId AND s.username = :username`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        termId,
                        username: data['Mã sinh viên'],
                    },
                },
            );

            if (studentTerm.length === 0) {
                return Error.sendNotFound(
                    res,
                    `Sinh viên có mã ${data['Mã sinh viên']} không tồn tại trong học kì này!`,
                );
            }

            const lecturerTerm = await LecturerTerm.findOne({
                where: {
                    term_id: term.id,
                    lecturer_id: req.user.id,
                },
            });

            if (!lecturerTerm) {
                return Error.sendNotFound(res, 'Giảng viên không tồn tại trong học kì này!');
            }

            const groupStudent = await GroupStudent.findOne({
                where: {
                    term_id: term.id,
                    name: data['Mã nhóm'],
                },
            });

            if (!groupStudent) {
                return Error.sendNotFound(
                    res,
                    `Nhóm có mã ${data['Mã nhóm']} không tồn tại trong học kì này!`,
                );
            }

            if (type !== 'ADVISOR') {
                const checkAssign = await sequelize.query(
                    `SELECT a.id
                    FROM assigns a
                    INNER JOIN group_lecturer_members glm ON a.group_lecturer_id = glm.group_lecturer_id
                    WHERE a.group_student_id = :groupStudentId AND glm.lecturer_term_id = :lecturerTermId AND a.type = :type`,
                    {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: {
                            groupStudentId: groupStudent.id,
                            lecturerTermId: lecturerTerm.id,
                            type: type,
                        },
                    },
                );

                if (checkAssign.length === 0) {
                    return Error.sendNotFound(
                        res,
                        `Bạn không được phân công chấm điểm cho nhóm có mã ${data['Mã nhóm']}!`,
                    );
                }
            } else {
                const checkLecturer = await sequelize.query(
                    `SELECT t.lecturer_term_id as id
                    FROM group_students gs
                    INNER JOIN topics t ON gs.topic_id = t.id
                    WHERE gs.id = :groupStudentId`,
                    {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: {
                            groupStudentId: groupStudent.id,
                        },
                    },
                );

                console.log(checkLecturer[0].id, lecturerTerm.id);

                if (checkLecturer[0].id !== lecturerTerm.id) {
                    return Error.sendNotFound(
                        res,
                        `Bạn không phải là giảng viên hướng dẫn của nhóm có mã ${data['Mã nhóm']}!`,
                    );
                }
            }

            const transcripts = [];
            for (const evaluation of evaluations) {
                if (!data[`${evaluation.key} (${evaluation.scoreMax})`]) {
                    return Error.sendWarning(
                        res,
                        `Tên cột ${evaluation.key} (${evaluation.scoreMax}) không đúng định dạng hoặc dòng dữ liệu thứ ${jsonData.indexOf(data) + 2} chứa giá trị rỗng của tên cột đó (nếu tên cột là dòng thứ 1 của file excel).`,
                    );
                }

                if (data[`${evaluation.key} (${evaluation.scoreMax})`] > evaluation.scoreMax) {
                    return Error.sendWarning(
                        res,
                        `Điểm ${evaluation.key} (${evaluation.scoreMax}) không được lớn hơn điểm tối đa của đánh giá!`,
                    );
                }

                transcripts.push({
                    evaluation_id: evaluation.id,
                    score: data[`${evaluation.key} (${evaluation.scoreMax})`],
                    student_term_id: studentTerm[0].id,
                    lecturer_term_id: lecturerTerm.id,
                });
            }

            for (const transcript of transcripts) {
                const checkTranscript = await Transcript.findOne({
                    where: {
                        student_term_id: transcript.student_term_id,
                        evaluation_id: transcript.evaluation_id,
                        lecturer_term_id: transcript.lecturer_term_id,
                    },
                });

                if (checkTranscript) {
                    await Transcript.update(
                        { score: transcript.score },
                        {
                            where: {
                                student_term_id: transcript.student_term_id,
                                evaluation_id: transcript.evaluation_id,
                                lecturer_term_id: transcript.lecturer_term_id,
                            },
                        },
                    );
                } else {
                    await Transcript.create(transcript);
                }
            }
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import bảng điểm thành công!',
        });
    } catch (error) {
        logger.error(error);
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

        // Check if student exist in term
        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: term.id,
                student_id: transcripts[0].studentId,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        for (const transcript of transcripts) {
            const { evaluationId, score } = transcript;

            // Check if evaluation exist
            const evaluation = await Evaluation.findByPk(evaluationId);
            if (!evaluation) {
                return Error.sendNotFound(res, 'Đánh giá không tồn tại!');
            }

            if (score > evaluation.scoreMax) {
                return Error.sendWarning(res, 'Điểm không được lớn hơn điểm tối đa của đánh giá!');
            }

            // Check if transcript exist
            const checkTranscript = await Transcript.findOne({
                where: {
                    student_term_id: studentTerm.id,
                    evaluation_id: evaluation.id,
                    lecturer_term_id: lecturerTerm.id,
                },
            });

            if (checkTranscript) {
                return Error.sendWarning(res, 'Bảng điểm đã tồn tại!');
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
        logger.error(error);
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

        // Check if student exist in term
        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: term.id,
                student_id: transcripts[0].studentId,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        for (const trans of transcripts) {
            const { evaluationId, score } = trans;

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
        logger.error(error);
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
        logger.error(error);
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
        logger.error(error);
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
        logger.error(error);
        Error.sendError(res, error);
    }
};
