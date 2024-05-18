const { Term, TermDetail } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Op, where } = require('sequelize');
const moment = require('moment');

exports.getTerms = async (req, res) => {
    try {
        const terms = await Term.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            order: [['startDate', 'DESC']],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            terms,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTermById = async (req, res) => {
    try {
        const { id } = req.params;
        const term = await Term.findOne({
            where: { id },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            term,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTermNow = async (req, res) => {
    try {
        const date = moment().format('YYYY-MM-DD');

        const term = await Term.findOne({
            where: {
                startDate: {
                    [Op.lte]: date,
                },
                endDate: {
                    [Op.gte]: date,
                },
            },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            term,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTermDetailWithChooseGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'CHOOSE_GROUP' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Term Detail not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            termDetail,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTermDetailWithChooseTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'CHOOSE_TOPIC' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Term Detail not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            termDetail,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTermDetailWithDiscussion = async (req, res) => {
    try {
        const { id } = req.params;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'DISCUSSION' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Term Detail not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            termDetail,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTermDetailWithReport = async (req, res) => {
    try {
        const { id } = req.params;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'REPORT' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Term Detail not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            termDetail,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getTermDetailWithPublicResult = async (req, res) => {
    try {
        const { id } = req.params;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'PUBLIC_RESULT' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Term Detail not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            termDetail,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createTerm = async (req, res) => {
    try {
        const { name, startDate, endDate } = req.body;
        // startDate have format 'YYYY-MM-DD' ?
        // endDate have format 'YYYY-MM-DD' ?

        const term = await Term.create({ name, startDate, endDate });
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            term,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startDate, endDate } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await term.update({ name, startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateChooseGroupTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'CHOOSE_GROUP' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });
        if (!termDetail) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateChooseTopicTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'CHOOSE_TOPIC' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });
        if (!termDetail) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateDiscussionTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'DISCUSSION' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateReportTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'REPORT' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });
        if (!termDetail) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updatePublicResultTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'PUBLIC_RESULT' },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
