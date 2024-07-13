const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getTerms,
    getTermByMajorId,
    getTermById,
    getTermNow,
    getTermDetailWithChooseGroup,
    getTermDetailWithChooseTopic,
    getTermDetailWithDiscussion,
    getTermDetailWithReport,
    getTermDetailWithPublicResult,
    createTerm,
    updateTerm,
    updatePublicResultTerm,
    updateDiscussionTerm,
    updateChooseTopicTerm,
    updateReportTerm,
    updateChooseGroupTerm,
} = require('../controllers/term.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');

const router = express.Router();

router.get(APP_ROUTER.TERM_NOW, getTermNow);

router.get(APP_ROUTER.TERM_BY_MAJOR, getTermByMajorId);

router.get(APP_ROUTER.INDEX, getTerms);

router.get(APP_ROUTER.ID, getTermById);

router.get(APP_ROUTER.TERM_CHOOSE_GROUP, getTermDetailWithChooseGroup);

router.get(APP_ROUTER.TERM_CHOOSE_TOPIC, getTermDetailWithChooseTopic);

router.get(APP_ROUTER.TERM_DISCUSSION, getTermDetailWithDiscussion);

router.get(APP_ROUTER.TERM_REPORT, getTermDetailWithReport);

router.get(APP_ROUTER.TERM_PUBLIC_RESULT, getTermDetailWithPublicResult);

// router.post(APP_ROUTER.INDEX, protectLecturer, createTerm);
router.post(APP_ROUTER.INDEX, createTerm);

router.put(APP_ROUTER.ID, protectLecturer, updateTerm);

router.put(APP_ROUTER.TERM_PUBLIC_RESULT, protectLecturer, updatePublicResultTerm);

router.put(APP_ROUTER.TERM_DISCUSSION, protectLecturer, updateDiscussionTerm);

router.put(APP_ROUTER.TERM_CHOOSE_TOPIC, protectLecturer, updateChooseTopicTerm);

router.put(APP_ROUTER.TERM_REPORT, protectLecturer, updateReportTerm);

router.put(APP_ROUTER.TERM_CHOOSE_GROUP, protectLecturer, updateChooseGroupTerm);

module.exports = router;
