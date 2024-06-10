const { Term, TermDetail } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { Op } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const { QueryTypes } = require('sequelize');
const _ = require('lodash');

exports.getTerms = async (req, res) => {
    try {
        const terms = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startChooseTopicDate, td2.end_date as endChooseTopicDate, td3.start_date as startDiscussionDate, td3.end_date as endDiscussionDate, td4.start_date as startReportDate, td4.end_date as endReportDate, td5.start_date as startPublicResultDate, td5.end_date as endPublicResultDate
            FROM terms t 
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'DISCUSSION'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'REPORT'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'PUBLIC_RESULT'
            ORDER BY t.start_date DESC`,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        );

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
        const term = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startChooseTopicDate, td2.end_date as endChooseTopicDate, td3.start_date as startDiscussionDate, td3.end_date as endDiscussionDate, td4.start_date as startReportDate, td4.end_date as endReportDate, td5.start_date as startPublicResultDate, td5.end_date as endPublicResultDate
            FROM terms t 
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'DISCUSSION'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'REPORT'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'PUBLIC_RESULT'
            WHERE t.id = :id
            ORDER BY t.start_date DESC`,
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            },
        );

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
        const term = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startChooseTopicDate, td2.end_date as endChooseTopicDate, td3.start_date as startDiscussionDate, td3.end_date as endDiscussionDate, td4.start_date as startReportDate, td4.end_date as endReportDate, td5.start_date as startPublicResultDate, td5.end_date as endPublicResultDate
            FROM terms t 
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'DISCUSSION'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'REPORT'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'PUBLIC_RESULT'
            WHERE t.start_date <= NOW() AND t.end_date >= NOW()`,
            {
                type: QueryTypes.SELECT,
            },
        );

        if (!term) {
            return Error.sendNotFound(res, 'Term not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            term: term[0],
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
            attributes: { exclude: ['created_at', 'updated_at'] },
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
            attributes: { exclude: ['created_at', 'updated_at'] },
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
            attributes: { exclude: ['created_at', 'updated_at'] },
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
            attributes: { exclude: ['created_at', 'updated_at'] },
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
            attributes: { exclude: ['created_at', 'updated_at'] },
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
        await TermDetail.bulkCreate([
            { term_id: term.id, name: 'CHOOSE_GROUP', startDate, endDate },
            { term_id: term.id, name: 'CHOOSE_TOPIC', startDate, endDate },
            { term_id: term.id, name: 'DISCUSSION', startDate, endDate },
            { term_id: term.id, name: 'REPORT', startDate, endDate },
            { term_id: term.id, name: 'PUBLIC_RESULT', startDate, endDate },
        ]);

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
            attributes: { exclude: ['created_at', 'updated_at'] },
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
            attributes: { exclude: ['created_at', 'updatedAt'] },
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
            attributes: { exclude: ['created_at', 'updatedAt'] },
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
            attributes: { exclude: ['created_at', 'updatedAt'] },
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
            attributes: { exclude: ['created_at', 'updatedAt'] },
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
