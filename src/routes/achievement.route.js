const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getAchievements,
    getAchievementById,
    createAchievement,
    updateAchievement,
    deleteAchievement,
} = require('../controllers/achievement.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getAchievements);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    createAchievement,
);

router.get(APP_ROUTER.ID, getAchievementById);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    updateAchievement,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    deleteAchievement,
);

module.exports = router;
