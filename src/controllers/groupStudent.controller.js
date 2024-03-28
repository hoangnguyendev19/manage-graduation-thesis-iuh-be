const { GroupStudent, StudentTerm, Student, Topic } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Op } = require('sequelize');

exports.getGroupStudents = async (req, res) => {
    try {
        const { termId, topicId, status } = req.query;
        let groupStudents = null;
        if (termId && !topicId && !status) {
            groupStudents = await GroupStudent.findAll({
                where: {
                    term_id: termId,
                },
            });
        } else if (termId && topicId && !status) {
            groupStudents = await GroupStudent.findAll({
                where: {
                    term_id: termId,
                    topic_id: topicId,
                },
            });
        } else if (termId && !topicId && status) {
            groupStudents = await GroupStudent.findAll({
                where: {
                    topic_id: topicId,
                    status: status,
                },
            });
        } else if (termId && topicId && status) {
            groupStudents = await GroupStudent.findAll({
                where: {
                    term_id: termId,
                    topic_id: topicId,
                    status: status,
                },
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupStudents,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentsByMajor = async (req, res) => {
    try {
        const { termId, majorId } = req.query;
        const groupStudents = await GroupStudent.findAll({
            where: {
                term_id: termId,
            },
            attributes: ['id', 'name'],
            include: {
                model: StudentTerm,
                attributes: ['student_id'],
                include: {
                    model: Student,
                    attributes: ['major_id'],
                    where: {
                        major_id: majorId,
                    },
                    as: 'student',
                },
                as: 'studentTerms',
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groups: groupStudents,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const groupStudent = await GroupStudent.findOne({
            where: {
                id: id,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getMyGroupStudent = async (req, res) => {
    try {
        const { termId } = req.query;
        const { id } = req.user;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: id,
                term_id: termId,
            },
        });

        const members = await StudentTerm.findAll({
            where: {
                group_student_id: studentTerm.group_student_id,
            },
            attributes: ['student_id', 'isAdmin'],
            include: {
                model: Student,
                attributes: ['userName', 'fullName', 'avatarUrl', 'gender', 'phoneNumber', 'email'],
                as: 'student',
            },
        });

        const groupStudent = await GroupStudent.findOne({
            where: {
                id: studentTerm.group_student_id,
            },
            attributes: ['id', 'name', 'typeReport', 'status', 'topic_id'],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            group: {
                info: groupStudent,
                members,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createGroupStudent = async (req, res) => {
    try {
        const { name, termId } = req.body;
        const groupStudent = await GroupStudent.create({
            name,
            term_id: termId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            groupStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateTypeReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { typeReport } = req.body;
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Group Student not found');
        }

        groupStudent.typeReport = typeReport;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            groupStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Group Student not found');
        }

        groupStudent.status = status;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            groupStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.assignTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { topicId } = req.body;
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Group Student not found');
        }

        groupStudent.topic_id = topicId;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            groupStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Group Student not found');
        }

        await groupStudent.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.addStudentToGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Group Student not found');
        }

        const studentTerm = await StudentTerm.create({
            student_id: studentId,
            term_id: groupStudent.term_id,
            group_student_id: groupStudent.id,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Add Success',
            studentTerm,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.removeStudentFromGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            Error.sendNotFound(res, 'Group Student not found');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: studentId,
                term_id: groupStudent.term_id,
                group_student_id: groupStudent.id,
            },
        });

        if (!studentTerm) {
            Error.sendNotFound(res, 'Student Term not found');
        }

        await studentTerm.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Remove Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
