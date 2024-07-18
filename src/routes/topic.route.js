const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getTopics,
    getTopicById,
    createTopic,
    updateTopic,
    updateQuantityGroupMax,
    updateStatusTopic,
    deleteTopic,
    importTopics,
    importTopicsFromTermIdToSelectedTermId,
} = require('../controllers/topic.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const upload = require('../configs/uploadConfig');
const router = express.Router();

router.get(APP_ROUTER.INDEX, getTopics);

router.post(APP_ROUTER.IMPORT, protectLecturer, upload.single('file'), importTopics);

router.post(APP_ROUTER.IMPORT_FROM_SELECT, protectLecturer, importTopicsFromTermIdToSelectedTermId);

router.get(APP_ROUTER.ID, getTopicById);

router.post(APP_ROUTER.INDEX, protectLecturer, createTopic);

router.put(APP_ROUTER.ID, protectLecturer, updateTopic);

router.put(APP_ROUTER.TOPIC_QUANTITY_GROUP_MAX, protectLecturer, updateQuantityGroupMax);

router.put(APP_ROUTER.TOPIC_STATUS, protectLecturer, updateStatusTopic);

router.delete(APP_ROUTER.ID, protectLecturer, deleteTopic);

module.exports = router;
