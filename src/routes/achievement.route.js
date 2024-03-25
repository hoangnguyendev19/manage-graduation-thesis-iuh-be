const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getAchievements,
    getAchievementById,
    createAchievement,
    updateAchievement,
    deleteAchievement,
} = require('../controllers/achievement.controller');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getAchievements);

router.get(APP_ROUTER.ID, getAchievementById);

router.post(APP_ROUTER.INDEX, createAchievement);

router.put(APP_ROUTER.ID, updateAchievement);

router.delete(APP_ROUTER.ID, deleteAchievement);

module.exports = router;
