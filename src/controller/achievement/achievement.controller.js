const { Achievement, StudentTerm } = require('../../schema/index');
const Error = require('../../helper/errors');
const { HTTP_STATUS } = require('../../constants/constant');
const { Op } = require('sequelize');

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
            return Error.sendNotFound(res, 'Student Term not found');
        }

        const achievements = await Achievement.findAll({
            where: {
                student_term_id: studentTerm.id,
            },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
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
            return Error.sendNotFound(res, 'Achievement not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
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
            return Error.sendNotFound(res, 'Student Term not found');
        }

        const achievement = await Achievement.create({
            name,
            bonus_score: bonusScore,
            student_term_id: studentTerm.id,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
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
            return Error.sendNotFound(res, 'Achievement not found');
        }

        await achievement.update({
            name,
            bonus_score: bonusScore,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
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
            return Error.sendNotFound(res, 'Achievement not found');
        }

        await achievement.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
