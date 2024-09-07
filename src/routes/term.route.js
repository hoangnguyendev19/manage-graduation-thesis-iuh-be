const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getTerms,
    getTermByMajorId,
    getTermById,
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
const { validateTerm, validateTermDetail } = require('../middleware/validation.middleware');

const router = express.Router();

router.get(APP_ROUTER.TERM_NOW, getTermNow);

router.get(APP_ROUTER.TERM_BY_MAJOR, getTermByMajorId);

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
    // validateTermDetail,
    updateChooseGroupTerm,
);

router.put(
    APP_ROUTER.TERM_PUBLIC_TOPIC,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    // validateTermDetail,
    updatePublicTopicTerm,
);

router.put(
    APP_ROUTER.TERM_CHOOSE_TOPIC,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    // validateTermDetail,
    updateChooseTopicTerm,
);

router.put(
    APP_ROUTER.TERM_DISCUSSION,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    // validateTermDetail,
    updateDiscussionTerm,
);

router.put(
    APP_ROUTER.TERM_REPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    // validateTermDetail,
    updateReportTerm,
);

router.put(
    APP_ROUTER.TERM_PUBLIC_RESULT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    // validateTermDetail,
    updatePublicResultTerm,
);

router.get(APP_ROUTER.ID, getTermById);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    // validateTerm,
    updateTerm,
);

router.get(APP_ROUTER.INDEX, getTerms);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    // validateTerm,
    createTerm,
);

module.exports = router;
