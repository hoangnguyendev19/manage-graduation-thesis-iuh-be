const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getTopicOfSearch,
    getTopicApprovedOfSearch,
    getTopicsByGroupLecturerId,
    getTopicById,
    createTopic,
    updateTopic,
    updateQuantityGroupMax,
    updateStatusTopic,
    deleteTopic,
    importTopics,
    exportTopics,
    importTopicsFromTermIdToSelectedTermId,
} = require('../controllers/topic.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const upload = require('../configs/uploadConfig');
const router = express.Router();

router.get(APP_ROUTER.TOPIC_BY_GROUP_LECTURER, getTopicsByGroupLecturerId);

router.get(APP_ROUTER.QUERY, getTopicOfSearch);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    upload.single('file'),
    importTopics,
);

router.post(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    exportTopics,
);

router.post(
    APP_ROUTER.IMPORT_FROM_SELECT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    importTopicsFromTermIdToSelectedTermId,
);

router.put(
    APP_ROUTER.TOPIC_QUANTITY_GROUP_MAX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    updateQuantityGroupMax,
);

router.put(
    APP_ROUTER.TOPIC_STATUS,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    updateStatusTopic,
);

router.get(APP_ROUTER.ID, getTopicById);

router.put(APP_ROUTER.ID, protectLecturer, updateTopic);

router.delete(APP_ROUTER.ID, protectLecturer, deleteTopic);

router.get(APP_ROUTER.INDEX, getTopicApprovedOfSearch);

router.post(APP_ROUTER.INDEX, protectLecturer, createTopic);

module.exports = router;
