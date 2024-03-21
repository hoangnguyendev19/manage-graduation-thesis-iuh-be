const { GroupLecturer, LecturerTerm, GroupLecturerMember } = require('../../schema/index');
const Error = require('../../helper/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');

exports.getGroupLecturers = async (req, res) => {
    try {
        const { termId, type } = req.query;
        let groupLecturers = null;
        if (termId && !type) {
            groupLecturers = await GroupLecturer.findAll({
                where: {
                    term_id: termId,
                },
            });
        }

        groupLecturers = await GroupLecturer.findAll({
            where: {
                term_id: termId,
                type: type,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupLecturers,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getGroupLecturerById = async (req, res) => {
    try {
        const { id } = req.params;
        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Group Lecturer not found');
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            groupLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createGroupLecturer = async (req, res) => {
    try {
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: req.user.id,
            },
        });
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        const { name, type } = req.body;
        const groupLecturer = await GroupLecturer.create({
            name,
            term_id: lecturerTerm.term_id,
            type,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            groupLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Group Lecturer not found');
        }
        await groupLecturer.update(req.body);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            groupLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const groupLecturer = await GroupLecturer.findByPk(id);
        if (!groupLecturer) {
            return Error.sendNotFound(res, 'Group Lecturer not found');
        }
        await groupLecturer.destroy();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.removeLecturerFromGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { lecturerId } = req.body;
        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
            },
        });
        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        const groupLecturerMember = await GroupLecturerMember.findOne({
            where: {
                group_lecturer_id: id,
                lecturer_term_id: lecturerTerm.id,
            },
        });

        if (!groupLecturerMember) {
            return Error.sendNotFound(res, 'Group Lecturer Member not found');
        }

        await groupLecturerMember.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Remove Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.addLecturerToGroupLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { lecturerId } = req.body;

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                lecturer_id: lecturerId,
            },
        });

        if (!lecturerTerm) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        const groupLecturerMember = await GroupLecturerMember.create({
            group_lecturer_id: id,
            lecturer_term_id: lecturerTerm.id,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Add Success',
            groupLecturerMember,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
