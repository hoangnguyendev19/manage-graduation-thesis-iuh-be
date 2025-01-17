const { Term, TermDetail } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/mysql.config');
const { QueryTypes } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');
const logger = require('../configs/logger.config');

exports.getTerms = async (req, res) => {
    try {
        const terms = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startPublicTopicDate, td2.end_date as endPublicTopicDate, td3.start_date as startChooseTopicDate, td3.end_date as endChooseTopicDate, td4.start_date as startDiscussionDate, td4.end_date as endDiscussionDate, td5.start_date as startReportDate, td5.end_date as endReportDate, td6.start_date as startPublicResultDate, td6.end_date as endPublicResultDate, m.name as majorName
            FROM terms t 
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'PUBLIC_TOPIC'  
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'DISCUSSION'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'REPORT'
            LEFT JOIN term_details td6 ON t.id = td6.term_id AND td6.name = 'PUBLIC_RESULT'
            LEFT JOIN majors m ON t.major_id = m.id
            ORDER BY t.start_date DESC`,
            {
                type: QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách học kỳ thành công!',
            terms,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getTermsByMajorId = async (req, res) => {
    try {
        const { id } = req.params;

        const terms = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startPublicTopicDate, td2.end_date as endPublicTopicDate, td3.start_date as startChooseTopicDate, td3.end_date as endChooseTopicDate, td4.start_date as startDiscussionDate, td4.end_date as endDiscussionDate, td5.start_date as startReportDate, td5.end_date as endReportDate, td6.start_date as startPublicResultDate, td6.end_date as endPublicResultDate, m.name as majorName
            FROM terms t 
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'PUBLIC_TOPIC'  
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'DISCUSSION'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'REPORT'
            LEFT JOIN term_details td6 ON t.id = td6.term_id AND td6.name = 'PUBLIC_RESULT'
            LEFT JOIN majors m ON t.major_id = m.id
            WHERE t.major_id = :majorId
            ORDER BY t.start_date DESC`,
            {
                type: QueryTypes.SELECT,
                replacements: { majorId: id },
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách học kỳ theo chuyên ngành thành công!',
            terms,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getTermById = async (req, res) => {
    try {
        const { id } = req.params;
        const term = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startPublicTopicDate, td2.end_date as endPublicTopicDate, td3.start_date as startChooseTopicDate, td3.end_date as endChooseTopicDate, td4.start_date as startDiscussionDate, td4.end_date as endDiscussionDate, td5.start_date as startReportDate, td5.end_date as endReportDate, td6.start_date as startPublicResultDate, td6.end_date as endPublicResultDate, m.name as majorName
            FROM terms t 
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'PUBLIC_TOPIC'  
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'DISCUSSION'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'REPORT'
            LEFT JOIN term_details td6 ON t.id = td6.term_id AND td6.name = 'PUBLIC_RESULT'
            LEFT JOIN majors m ON t.major_id = m.id
            WHERE t.id = :id
            ORDER BY t.start_date DESC`,
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            },
        );

        if (term.length === 0) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin học kỳ thành công!',
            term: term[0],
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getTermNow = async (req, res) => {
    try {
        const { majorId } = req.query;

        const term = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startPublicTopicDate, td2.end_date as endPublicTopicDate, td3.start_date as startChooseTopicDate, td3.end_date as endChooseTopicDate, td4.start_date as startDiscussionDate, td4.end_date as endDiscussionDate, td5.start_date as startReportDate, td5.end_date as endReportDate, td6.start_date as startPublicResultDate, td6.end_date as endPublicResultDate, m.name as majorName
            FROM terms t 
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'PUBLIC_TOPIC'  
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'DISCUSSION'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'REPORT'
            LEFT JOIN term_details td6 ON t.id = td6.term_id AND td6.name = 'PUBLIC_RESULT'
            LEFT JOIN majors m ON t.major_id = m.id
            WHERE t.start_date <= NOW() AND t.end_date >= NOW() AND t.major_id = :majorId`,
            {
                type: QueryTypes.SELECT,
                replacements: { majorId },
            },
        );

        if (term.length === 0) {
            return Error.sendNotFound(res, 'Học kỳ hiện tại không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin học kỳ hiện tại thành công!',
            term: term[0],
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getTermByStudentId = async (req, res) => {
    try {
        const term = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startPublicTopicDate, td2.end_date as endPublicTopicDate, td3.start_date as startChooseTopicDate, td3.end_date as endChooseTopicDate, td4.start_date as startDiscussionDate, td4.end_date as endDiscussionDate, td5.start_date as startReportDate, td5.end_date as endReportDate, td6.start_date as startPublicResultDate, td6.end_date as endPublicResultDate, m.name as majorName
            FROM students s
            LEFT JOIN student_terms st ON s.id = st.student_id
            LEFT JOIN terms t ON st.term_id = t.id
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'PUBLIC_TOPIC'  
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'DISCUSSION'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'REPORT'
            LEFT JOIN term_details td6 ON t.id = td6.term_id AND td6.name = 'PUBLIC_RESULT'
            LEFT JOIN majors m ON t.major_id = m.id
            WHERE s.id = :studentId
            ORDER BY t.start_date DESC
            LIMIT 1`,
            {
                type: QueryTypes.SELECT,
                replacements: { studentId: req.user.id },
            },
        );

        if (term.length === 0) {
            return Error.sendNotFound(res, 'Học kỳ mà sinh viên tham gia không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin học kỳ mà sinh viên tham gia thành công!',
            term: term[0],
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getTermsByLecturerId = async (req, res) => {
    try {
        let terms = await sequelize.query(
            `SELECT t.id, t.name, t.start_date as startDate, t.end_date as endDate, td1.start_date as startChooseGroupDate, td1.end_date as endChooseGroupDate, td2.start_date as startPublicTopicDate, td2.end_date as endPublicTopicDate, td3.start_date as startChooseTopicDate, td3.end_date as endChooseTopicDate, td4.start_date as startDiscussionDate, td4.end_date as endDiscussionDate, td5.start_date as startReportDate, td5.end_date as endReportDate, td6.start_date as startPublicResultDate, td6.end_date as endPublicResultDate, m.id as majorId, m.name as majorName
            FROM terms t 
            LEFT JOIN term_details td1 ON t.id = td1.term_id AND td1.name = 'CHOOSE_GROUP'
            LEFT JOIN term_details td2 ON t.id = td2.term_id AND td2.name = 'PUBLIC_TOPIC'  
            LEFT JOIN term_details td3 ON t.id = td3.term_id AND td3.name = 'CHOOSE_TOPIC'
            LEFT JOIN term_details td4 ON t.id = td4.term_id AND td4.name = 'DISCUSSION'
            LEFT JOIN term_details td5 ON t.id = td5.term_id AND td5.name = 'REPORT'
            LEFT JOIN term_details td6 ON t.id = td6.term_id AND td6.name = 'PUBLIC_RESULT'
            LEFT JOIN majors m ON t.major_id = m.id
            LEFT JOIN lecturer_terms lt ON t.id = lt.term_id
            WHERE lt.lecturer_id = :lecturerId`,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    lecturerId: req.user.id,
                },
            },
        );

        terms = terms.reduce((acc, term) => {
            const major = acc.find((m) => m.majorId === term.majorId);

            if (!major) {
                acc.push({
                    majorId: term.majorId,
                    majorName: term.majorName,
                    terms: [
                        {
                            id: term.id,
                            name: term.name,
                            startDate: term.startDate,
                            endDate: term.endDate,
                            startChooseGroupDate: term.startChooseGroupDate,
                            endChooseGroupDate: term.endChooseGroupDate,
                            startPublicTopicDate: term.startPublicTopicDate,
                            endPublicTopicDate: term.endPublicTopicDate,
                            startChooseTopicDate: term.startChooseTopicDate,
                            endChooseTopicDate: term.endChooseTopicDate,
                            startDiscussionDate: term.startDiscussionDate,
                            endDiscussionDate: term.endDiscussionDate,
                            startReportDate: term.startReportDate,
                            endReportDate: term.endReportDate,
                            startPublicResultDate: term.startPublicResultDate,
                            endPublicResultDate: term.endPublicResultDate,
                        },
                    ],
                });
            } else {
                major.terms.push({
                    id: term.id,
                    name: term.name,
                    startDate: term.startDate,
                    endDate: term.endDate,
                    startChooseGroupDate: term.startChooseGroupDate,
                    endChooseGroupDate: term.endChooseGroupDate,
                    startPublicTopicDate: term.startPublicTopicDate,
                    endPublicTopicDate: term.endPublicTopicDate,
                    startChooseTopicDate: term.startChooseTopicDate,
                    endChooseTopicDate: term.endChooseTopicDate,
                    startDiscussionDate: term.startDiscussionDate,
                    endDiscussionDate: term.endDiscussionDate,
                    startReportDate: term.startReportDate,
                    endReportDate: term.endReportDate,
                    startPublicResultDate: term.startPublicResultDate,
                    endPublicResultDate: term.endPublicResultDate,
                });
            }

            return acc;
        }, []);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách học kỳ theo giảng viên thành công!',
            terms,
        });
    } catch (error) {
        logger.error(error);
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
            return Error.sendNotFound(res, 'Thời gian chọn nhóm không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin thời gian chọn nhóm thành công!',
            termDetail,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getTermDetailWithPublicTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'PUBLIC_TOPIC' },
            attributes: { exclude: ['created_at', 'updated_at'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Thời gian công bố đề tài không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin thời gian công bố đề tài thành công!',
            termDetail,
        });
    } catch (error) {
        logger.error(error);
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
            return Error.sendNotFound(res, 'Thời gian chọn đề tài không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin thời gian chọn đề tài thành công!',
            termDetail,
        });
    } catch (error) {
        logger.error(error);
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
            return Error.sendNotFound(res, 'Thời gian phản biện không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin thời gian phản biện thành công!',
            termDetail,
        });
    } catch (error) {
        logger.error(error);
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
            return Error.sendNotFound(res, 'Thời gian báo cáo không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin thời gian báo cáo thành công!',
            termDetail,
        });
    } catch (error) {
        logger.error(error);
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
            return Error.sendNotFound(res, 'Thời gian công bố kết quả không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin thời gian công bố kết quả thành công!',
            termDetail,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.createTerm = async (req, res) => {
    try {
        const { name, startDate, endDate, majorId } = req.body;

        // check if startDate and endDate is valid using moment
        if (moment(startDate).isAfter(endDate)) {
            return Error.sendWarning(res, 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }

        const existedTerm = await Term.findOne({
            where: {
                major_id: majorId,
                name,
            },
        });

        if (existedTerm) {
            return Error.sendConflict(res, 'Tên học kỳ đã tồn tại!');
        }

        const term = await Term.create({ name, startDate, endDate, major_id: majorId });
        await TermDetail.bulkCreate([
            { term_id: term.id, name: 'CHOOSE_GROUP', startDate, endDate },
            { term_id: term.id, name: 'PUBLIC_TOPIC', startDate, endDate },
            { term_id: term.id, name: 'CHOOSE_TOPIC', startDate, endDate },
            { term_id: term.id, name: 'DISCUSSION', startDate, endDate },
            { term_id: term.id, name: 'REPORT', startDate, endDate },
            { term_id: term.id, name: 'PUBLIC_RESULT', startDate, endDate },
        ]);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo học kỳ thành công!',
            term,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        // check if startDate and endDate is valid using moment
        if (moment(startDate).isAfter(endDate)) {
            return Error.sendWarning(res, 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        await term.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật học kỳ thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateChooseGroupTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // check if startDate and endDate is valid using moment
        if (moment(startDate).isAfter(endDate)) {
            return Error.sendWarning(res, 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }

        // check if startDate and endDate is less than or equal to term start date and end date using moment
        if (moment(startDate).isBefore(term.startDate) || moment(endDate).isAfter(term.endDate)) {
            return Error.sendWarning(
                res,
                'Ngày bắt đầu và kết thúc phải nằm trong khoảng thời gian của học kỳ!',
            );
        }

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'CHOOSE_GROUP' },
            attributes: { exclude: ['created_at', 'updated_at'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Thời gian chọn nhóm của học kỳ không tồn tại!');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thời gian chọn nhóm thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updatePublicTopicTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // check if startDate and endDate is valid using moment
        if (moment(startDate).isAfter(endDate)) {
            return Error.sendWarning(res, 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }

        // check if startDate and endDate is less than or equal to term start date and end date using moment
        if (moment(startDate).isBefore(term.startDate) || moment(endDate).isAfter(term.endDate)) {
            return Error.sendWarning(
                res,
                'Ngày bắt đầu và kết thúc phải nằm trong khoảng thời gian của học kỳ!',
            );
        }

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'PUBLIC_TOPIC' },
            attributes: { exclude: ['created_at', 'updated_at'] },
        });
        if (!termDetail) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thời gian công bố đề tài thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateChooseTopicTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // check if startDate and endDate is valid using moment
        if (moment(startDate).isAfter(endDate)) {
            return Error.sendWarning(res, 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }

        // check if startDate and endDate is less than or equal to term start date and end date using moment
        if (moment(startDate).isBefore(term.startDate) || moment(endDate).isAfter(term.endDate)) {
            return Error.sendWarning(
                res,
                'Ngày bắt đầu và kết thúc phải nằm trong khoảng thời gian của học kỳ!',
            );
        }

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'CHOOSE_TOPIC' },
            attributes: { exclude: ['created_at', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thời gian chọn đề tài thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateDiscussionTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // check if startDate and endDate is valid using moment
        if (moment(startDate).isAfter(endDate)) {
            return Error.sendWarning(res, 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }

        // check if startDate and endDate is less than or equal to term start date and end date using moment
        if (moment(startDate).isBefore(term.startDate) || moment(endDate).isAfter(term.endDate)) {
            return Error.sendWarning(
                res,
                'Ngày bắt đầu và kết thúc phải nằm trong khoảng thời gian của học kỳ!',
            );
        }

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'DISCUSSION' },
            attributes: { exclude: ['created_at', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thời gian phản biện thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateReportTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // check if startDate and endDate is valid using moment
        if (moment(startDate).isAfter(endDate)) {
            return Error.sendWarning(res, 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }

        // check if startDate and endDate is less than or equal to term start date and end date using moment
        if (moment(startDate).isBefore(term.startDate) || moment(endDate).isAfter(term.endDate)) {
            return Error.sendWarning(
                res,
                'Ngày bắt đầu và kết thúc phải nằm trong khoảng thời gian của học kỳ!',
            );
        }

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'REPORT' },
            attributes: { exclude: ['created_at', 'updatedAt'] },
        });
        if (!termDetail) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thời gian báo cáo thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updatePublicResultTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // check if startDate and endDate is valid using moment
        if (moment(startDate).isAfter(endDate)) {
            return Error.sendWarning(res, 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }

        // check if startDate and endDate is less than or equal to term start date and end date using moment
        if (moment(startDate).isBefore(term.startDate) || moment(endDate).isAfter(term.endDate)) {
            return Error.sendWarning(
                res,
                'Ngày bắt đầu và kết thúc phải nằm trong khoảng thời gian của học kỳ!',
            );
        }

        const termDetail = await TermDetail.findOne({
            where: { term_id: id, name: 'PUBLIC_RESULT' },
            attributes: { exclude: ['created_at', 'updatedAt'] },
        });

        if (!termDetail) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        await termDetail.update({ startDate, endDate });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thời gian công bố kết quả thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.deleteTerm = async (req, res) => {
    try {
        const { id } = req.params;

        const term = await Term.findByPk(id);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        await term.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xóa học kỳ thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};
