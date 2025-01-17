const { Major } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { validationResult } = require('express-validator');
const logger = require('../configs/logger.config');

exports.getMajors = async (req, res) => {
    try {
        const majors = await Major.findAll();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách chuyên ngành thành công!',
            majors,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getMajorById = async (req, res) => {
    try {
        const { id } = req.params;
        const major = await Major.findByPk(id);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin chuyên ngành thành công!',
            major,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.createMajor = async (req, res) => {
    try {
        const { name } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const existedMajor = await Major.findOne({ where: { name } });
        if (existedMajor) {
            return Error.sendConflict(res, 'Tên chuyên ngành đã tồn tại!');
        }

        const major = await Major.create({ name });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo chuyên ngành thành công!',
            major,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const major = await Major.findByPk(id);

        if (!major) {
            return Error.sendNotFound(res, 'Chuyên ngành không tồn tại!');
        }

        major.name = name;
        await major.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật chuyên ngành thành công!',
            major,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.deleteMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const major = await Major.findByPk(id);

        if (!major) {
            return Error.sendNotFound(res, 'Chuyên ngành không tồn tại!');
        }

        await major.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá chuyên ngành thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};
