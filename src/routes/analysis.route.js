const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    analysisOfTopics,
    analysisOfLecturers,
    getKeywords,
} = require('../controllers/analysis.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.post(
    APP_ROUTER.ANALYSIS_TOPICS,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    analysisOfTopics,
);

router.post(
    APP_ROUTER.ANALYSIS_LECTURERS,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    analysisOfLecturers,
);

router.get(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    getKeywords,
);

module.exports = router;
