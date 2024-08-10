const { Achievement, StudentTerm } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');

exports.getAchievements = async (req, res) => {
    try {
        const { termId, studentId } = req.query;

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: studentId,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ này');
        }

        const achievements = await Achievement.findAll({
            where: {
                student_term_id: studentTerm.id,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách thành tích thành công!',
            achievements,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getAchievementById = async (req, res) => {
    try {
        const { id } = req.params;

        const achievement = await Achievement.findOne({
            where: {
                id,
            },
        });

        if (!achievement) {
            return Error.sendNotFound(res, 'Thành tích không tồn tại');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lây thông tin thành tích thành công!',
            achievement,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createAchievement = async (req, res) => {
    try {
        const { name, bonusScore, termId, studentId } = req.body;

        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: studentId,
            },
        });
        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ này');
        }

        const achievement = await Achievement.create({
            name,
            bonus_score: bonusScore,
            student_term_id: studentTerm.id,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo thành tích thành công!',
            achievement,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bonusScore } = req.body;

        const achievement = await Achievement.findByPk(id);

        if (!achievement) {
            return Error.sendNotFound(res, 'Thành tích không tồn tại!');
        }

        await achievement.update({
            name,
            bonus_score: bonusScore,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thành tích thành công!',
            achievement,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteAchievement = async (req, res) => {
    try {
        const { id } = req.params;

        const achievement = await Achievement.findByPk(id);

        if (!achievement) {
            return Error.sendNotFound(res, 'Thành tích không tồn tại!');
        }

        await achievement.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá thành tích thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
