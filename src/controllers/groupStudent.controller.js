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

        const groups = groupStudents.map((group) => {
            return {
                id: group.id,
                name: group.name,
                total: group.studentTerms.length,
            };
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groups,
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

        if (!studentTerm.group_student_id) {
            return Error.sendNotFound(res, 'You do not have a group');
        }

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

        const stdTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                term_id: termId,
            },
        });

        if (stdTerm.group_student_id) {
            return Error.sendWarning(res, 'You already have a group');
        }

        const groupStd = await GroupStudent.findOne({
            where: {
                name: name,
                term_id: termId,
            },
        });

        if (groupStd) {
            return Error.sendWarning(res, 'Group Student already exists');
        }

        const groupStudent = await GroupStudent.create({
            name,
            term_id: termId,
        });

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                term_id: termId,
            },
        });

        studentTerm.group_student_id = groupStudent.id;
        studentTerm.isAdmin = true;
        await studentTerm.save();

        const group = await GroupStudent.findOne({
            where: {
                id: groupStudent.id,
            },
            attributes: ['id', 'name'],
            include: {
                model: StudentTerm,
                attributes: ['student_id'],
                include: {
                    model: Student,
                    attributes: ['major_id'],
                    where: {
                        major_id: req.user.major_id,
                    },
                    as: 'student',
                },
                as: 'studentTerms',
            },
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            group: {
                id: group.id,
                name: group.name,
                total: group.studentTerms.length,
            },
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

exports.assignAdminGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: studentId,
                group_student_id: id,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Student Term not found');
        }

        studentTerm.isAdmin = true;
        await studentTerm.save();

        const currentAdmin = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        currentAdmin.isAdmin = false;
        await currentAdmin.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.removeMemberGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        const studentAdmin = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        if (!studentAdmin.isAdmin) {
            return Error.sendForbidden(res, 'You are not an admin of this group');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: studentId,
                group_student_id: id,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Student Term not found');
        }

        studentTerm.group_student_id = null;
        studentTerm.isAdmin = false;

        await studentTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.leaveGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        studentTerm.group_student_id = null;
        studentTerm.isAdmin = false;

        await studentTerm.save();

        const studentTerms = await StudentTerm.findAll({
            where: {
                group_student_id: id,
            },
        });

        if (studentTerms.length === 0) {
            const groupStudent = await GroupStudent.findByPk(id);
            await groupStudent.destroy();
        } else if (studentTerms.length === 1) {
            studentTerms[0].isAdmin = true;
            await studentTerms[0].save();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Remove Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.joinGroupStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
            },
        });

        if (studentTerm.group_student_id) {
            return Error.sendWarning(res, 'You already have a group');
        }

        studentTerm.group_student_id = id;
        studentTerm.isAdmin = false;

        await studentTerm.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Join Success',
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

exports.chooseTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { topicId } = req.body;

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Group Student not found');
        }

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        if (!studentTerm.isAdmin) {
            return Error.sendForbidden(res, 'You are not admin of group');
        }

        const topic = await Topic.findByPk(topicId);
        if (!topic) {
            return Error.sendNotFound(res, 'Topic not found');
        }

        groupStudent.topic_id = topicId;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Choose Topic Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.cancelTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const studentTerm = await StudentTerm.findOne({
            where: {
                student_id: req.user.id,
                group_student_id: id,
            },
        });

        if (!studentTerm.isAdmin) {
            return Error.sendForbidden(res, 'You are not admin of group');
        }

        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Group Student not found');
        }

        groupStudent.topic_id = null;
        await groupStudent.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cancel Topic Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
