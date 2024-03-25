const { Major } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');

exports.getMajors = async (req, res) => {
    try {
        const majors = await Major.findAll();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            status: HTTP_STATUS.OK,
            message: 'Get Success',
            majors,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getMajorById = async (req, res) => {
    try {
        const { id } = req.params;
        const major = await Major.findByPk(id);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            status: HTTP_STATUS.OK,
            message: 'Get Success',
            major,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createMajor = async (req, res) => {
    try {
        const { name } = req.body;
        const major = await Major.create({ name });
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            status: HTTP_STATUS.CREATED,
            message: 'Create Success',
            major,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const major = await Major.findByPk(id);
        major.name = name;
        await major.save();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            status: HTTP_STATUS.OK,
            message: 'Update Success',
            major,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const major = await Major.findByPk(id);
        await major.destroy();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            status: HTTP_STATUS.OK,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
