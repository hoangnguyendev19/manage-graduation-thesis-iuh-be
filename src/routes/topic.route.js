const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getTopics,
    getTopicById,
    createTopic,
    updateTopic,
    updateStatusTopic,
    deleteTopic,
} = require('../controllers/topic.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getTopics);

router.get(APP_ROUTER.ID, getTopicById);

router.post(APP_ROUTER.INDEX, protectLecturer, createTopic);

router.put(APP_ROUTER.ID, protectLecturer, updateTopic);

router.put(
    APP_ROUTER.TOPIC_STATUS,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    updateStatusTopic,
);

router.delete(APP_ROUTER.ID, protectLecturer, deleteTopic);

module.exports = router;
