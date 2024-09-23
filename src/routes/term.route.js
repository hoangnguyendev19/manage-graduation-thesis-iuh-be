const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getTerms,
    getTermsByMajorId,
    getTermById,
    getTermsByLecturerId,
    getTermNow,
    getTermDetailWithChooseGroup,
    getTermDetailWithPublicTopic,
    getTermDetailWithChooseTopic,
    getTermDetailWithDiscussion,
    getTermDetailWithReport,
    getTermDetailWithPublicResult,
    createTerm,
    updateTerm,
    updateChooseGroupTerm,
    updatePublicTopicTerm,
    updateChooseTopicTerm,
    updateDiscussionTerm,
    updateReportTerm,
    updatePublicResultTerm,
} = require('../controllers/term.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.TERM_NOW, getTermNow);

router.get(APP_ROUTER.TERM_BY_MAJOR, getTermsByMajorId);

router.get(APP_ROUTER.TERM_BY_LECTURER, protectLecturer, getTermsByLecturerId);

router.get(APP_ROUTER.TERM_CHOOSE_GROUP, getTermDetailWithChooseGroup);

router.get(APP_ROUTER.TERM_PUBLIC_TOPIC, getTermDetailWithPublicTopic);

router.get(APP_ROUTER.TERM_CHOOSE_TOPIC, getTermDetailWithChooseTopic);

router.get(APP_ROUTER.TERM_DISCUSSION, getTermDetailWithDiscussion);

router.get(APP_ROUTER.TERM_REPORT, getTermDetailWithReport);

router.get(APP_ROUTER.TERM_PUBLIC_RESULT, getTermDetailWithPublicResult);

router.put(
    APP_ROUTER.TERM_CHOOSE_GROUP,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateChooseGroupTerm,
);

router.put(
    APP_ROUTER.TERM_PUBLIC_TOPIC,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updatePublicTopicTerm,
);

router.put(
    APP_ROUTER.TERM_CHOOSE_TOPIC,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateChooseTopicTerm,
);

router.put(
    APP_ROUTER.TERM_DISCUSSION,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateDiscussionTerm,
);

router.put(
    APP_ROUTER.TERM_REPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateReportTerm,
);

router.put(
    APP_ROUTER.TERM_PUBLIC_RESULT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updatePublicResultTerm,
);

router.get(APP_ROUTER.ID, getTermById);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateTerm,
);

router.get(APP_ROUTER.INDEX, getTerms);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    createTerm,
);

module.exports = router;
