const { Evaluation, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const xlsx = require('xlsx');
const { validationResult } = require('express-validator');

exports.getEvaluations = async (req, res) => {
    try {
        const { termId, type } = req.query;

        // Check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const evaluations = await Evaluation.findAll({
            where: {
                term_id: termId,
                type: type,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách đánh giá thành công!',
            evaluations,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getEvaluationsForScoring = async (req, res) => {
    try {
        const { termId, type } = req.query;

        // Check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const evaluations = await Evaluation.findAll({
            where: {
                term_id: termId,
                type: type,
            },
            attributes: ['id', 'key', 'name', 'scoreMax'],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách đánh giá thành công!',
            evaluations,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getEvaluationById = async (req, res) => {
    try {
        const { id } = req.params;

        const evaluation = await Evaluation.findByPk(id);
        if (!evaluation) {
            return Error.sendNotFound(res, 'Đánh giá không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin đánh giá thành công!',
            evaluation,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createEvaluation = async (req, res) => {
    try {
        const { key, name, scoreMax, type, termId, description } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const evaluation = await Evaluation.create({
            key,
            name,
            scoreMax,
            type,
            description,
            term_id: termId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo đánh giá thành công!',
            evaluation,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importEvaluations = async (req, res) => {
    try {
        const { termId, type } = req.body;

        // Check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        if (!req.file) {
            return Error.sendWarning(res, 'Hãy chọn file để import!');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        if (jsonData.length % 2 !== 0) {
            return Error.sendWarning(
                res,
                'File không đúng định dạng! Bạn hãy kiểm tra lại số dòng trong file excel.',
            );
        }

        const evaluations = [];
        // STT	LO	A-Failed B-Fair	C-Accepted	D-Excellent	Max
        for (let i = 0; i < jsonData.length; i += 2) {
            const evaluation = {
                key: `LO${jsonData[i].STT}`,
                name: jsonData[i].LO,
                scoreMax: jsonData[i + 1]['Max'],
                description: `${jsonData[i].Failed} - ${jsonData[i + 1].Failed}; ${jsonData[i].Fair} - ${jsonData[i + 1].Fair}; ${jsonData[i].Accepted} - ${jsonData[i + 1].Accepted}; ${jsonData[i].Excellent} - ${jsonData[i + 1].Excellent}`,
                term_id: termId,
                type,
            };

            evaluations.push(evaluation);
        }

        await Evaluation.bulkCreate(evaluations);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Nhập danh sách đánh giá thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importEvaluationsFromTermIdToSelectedTermId = async (req, res) => {
    try {
        const { termId, selectedTermId, type } = req.body;

        // Check if term exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        // Check if selected term exists
        const selectedTerm = await Term.findByPk(selectedTermId);
        if (!selectedTerm) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const evaluations = await Evaluation.findAll({
            where: {
                term_id: termId,
                type: type,
            },
        });

        for (const evaluation of evaluations) {
            await Evaluation.create({
                key: evaluation.key,
                name: evaluation.name,
                scoreMax: evaluation.scoreMax,
                description: evaluation.description,
                type: evaluation.type,
                term_id: selectedTermId,
            });
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Nhập danh sách đánh giá thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const { key, name, scoreMax, description } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const evaluation = await Evaluation.findByPk(id);
        if (!evaluation) {
            return Error.sendNotFound(res, 'Đánh giá không tồn tại!');
        }

        evaluation.key = key;
        evaluation.name = name;
        evaluation.scoreMax = scoreMax;
        evaluation.description = description;
        await evaluation.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật đánh giá thành công!',
            evaluation,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const evaluation = await Evaluation.findByPk(id);
        if (!evaluation) {
            return Error.sendNotFound(res, 'Đánh giá không tồn tại!');
        }

        await evaluation.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá đánh giá thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
