const { Evaluation, Term } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const xlsx = require('xlsx');

exports.getEvaluations = async (req, res) => {
    try {
        const { termId, type } = req.query;
        const evaluations = await Evaluation.findAll({
            where: {
                term_id: termId,
                type: type,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get success!',
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
        const evaluations = await Evaluation.findAll({
            where: {
                term_id: termId,
                type: type,
            },
            attributes: ['id', 'name', 'scoreMax'],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get success!',
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
            message: 'Get success!',
            evaluation,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createEvaluation = async (req, res) => {
    try {
        const { name, scoreMax, type, termId, description } = req.body;

        const evaluation = await Evaluation.create({
            name,
            scoreMax,
            type,
            description,
            term_id: termId,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create success!',
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

        if (!req.file) {
            return Error.sendWarning(res, 'Hãy chọn file để import!');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // get the first sheet name
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        const evaluations = [];
        // STT	LO	A-Failed	B-Fair	C-Accepted	D-Excellent	Max grade
        jsonData.forEach(async (evaluation) => {
            const name = evaluation['LO'];
            const scoreMax = Number(evaluation['Max grade'].toString().trim());
            const description =
                evaluation['A-Failed'] +
                ' ; ' +
                evaluation['B-Fair'] +
                ' ; ' +
                evaluation['C-Accepted'] +
                ' ; ' +
                evaluation['D-Excellent'];
            const term_id = termId;

            evaluations.push({ name, scoreMax, type, description, term_id });
        });

        await Evaluation.bulkCreate(evaluations);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importEvaluationsFromTermIdToSelectedTermId = async (req, res) => {
    try {
        const { termId, selectedTermId, type } = req.body;

        const evaluations = await Evaluation.findAll({
            where: {
                term_id: termId,
                type: type,
            },
        });

        for (const evaluation of evaluations) {
            await Evaluation.create({
                name: evaluation.name,
                scoreMax: evaluation.scoreMax,
                description: evaluation.description,
                type: evaluation.type,
                term_id: selectedTermId,
            });
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, scoreMax, type, description } = req.body;

        const evaluation = await Evaluation.findByPk(id);
        if (!evaluation) {
            return Error.sendNotFound(res, 'Đánh giá không tồn tại!');
        }

        evaluation.name = name;
        evaluation.scoreMax = scoreMax;
        evaluation.type = type;
        evaluation.description = description;
        await evaluation.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update success!',
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
            message: 'Delete success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
