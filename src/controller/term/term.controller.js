const { Term } = require('../../schema/index');
const Error = require('../../helper/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');
const moment = require('moment');

exports.getTerms = async (req, res) => {
    try {
        const terms = await Term.findAll();
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
        const term = await Term.findByPk(id);
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

exports.updatePublicResultTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublicResult } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await term.update({ isPublicResult });
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
        const { isReport } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await term.update({ isReport });
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
        const { isDiscussion } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await term.update({ isDiscussion });
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
        const { isChooseTopic } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await term.update({ isChooseTopic });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateSubmitTopicTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { isSubmitTopic } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        await term.update({ isSubmitTopic });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
