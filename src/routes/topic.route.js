const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getTopicsOfSearch,
    getTopicsApprovedOfSearch,
    getTopicsApproved,
    getTopicsByGroupLecturerId,
    getTopicByLecturer,
    getTopicById,
    countTopicsByTermId,
    countTopicsByLecturerId,
    createTopic,
    updateTopic,
    updateQuantityGroupMax,
    updateStatusTopic,
    deleteTopic,
    importTopics,
    exportTopics,
    exportTopicsByLecturerId,
    importTopicsFromTermIdToSelectedTermId,
    getKeywords,
} = require('../controllers/topic.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { validateTopic } = require('../middleware/validation.middleware');
const upload = require('../configs/upload.config');
const { protectStudent } = require('../middleware/student.middleware');
const router = express.Router();

router.get(APP_ROUTER.TOPIC_BY_LECTURER, protectLecturer, getTopicByLecturer);

router.get(APP_ROUTER.TOPIC_BY_GROUP_LECTURER, protectLecturer, getTopicsByGroupLecturerId);

router.get(APP_ROUTER.QUERY, protectLecturer, getTopicsOfSearch);

router.get(APP_ROUTER.COUNT, protectLecturer, countTopicsByTermId);

router.get(APP_ROUTER.COUNT_BY_LECTURER, protectLecturer, countTopicsByLecturerId);

router.get(APP_ROUTER.TOPIC_KEYWORDS, getKeywords);

router.post(APP_ROUTER.IMPORT, protectLecturer, upload.single('file'), importTopics);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    exportTopics,
);

router.get(APP_ROUTER.EXPORT_ME, protectLecturer, exportTopicsByLecturerId);

router.post(
    APP_ROUTER.IMPORT_FROM_SELECT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    importTopicsFromTermIdToSelectedTermId,
);

router.put(
    APP_ROUTER.TOPIC_QUANTITY_GROUP_MAX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateQuantityGroupMax,
);

router.put(
    APP_ROUTER.TOPIC_STATUS,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateStatusTopic,
);

router.get(APP_ROUTER.TOPIC_APPROVED, protectLecturer, getTopicsApproved);

router.get(APP_ROUTER.ID, getTopicById);

router.put(APP_ROUTER.ID, protectLecturer, validateTopic, updateTopic);

router.delete(APP_ROUTER.ID, protectLecturer, deleteTopic);

router.get(APP_ROUTER.INDEX, protectStudent, getTopicsApprovedOfSearch);

router.post(APP_ROUTER.INDEX, protectLecturer, validateTopic, createTopic);

module.exports = router;
