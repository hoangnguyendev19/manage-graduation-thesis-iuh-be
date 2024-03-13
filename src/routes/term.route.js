const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getTerms,
    getTermById,
    getTermNow,
    createTerm,
    updateTerm,
    updatePublicResultTerm,
    updateDiscussionTerm,
    updateChooseTopicTerm,
    updateReportTerm,
    updateSubmitTopicTerm,
} = require('../controller/term/term.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.TERM_NOW, getTermNow);

router.get(APP_ROUTER.INDEX, getTerms);

router.get(APP_ROUTER.ID, getTermById);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), createTerm);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateTerm);

router.put(
    APP_ROUTER.TERM_PUBLIC_RESULT,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    updatePublicResultTerm,
);

router.put(
    APP_ROUTER.TERM_DISCUSSION,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    updateDiscussionTerm,
);

router.put(
    APP_ROUTER.TERM_CHOOSE_TOPIC,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    updateChooseTopicTerm,
);

router.put(
    APP_ROUTER.TERM_REPORT,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    updateReportTerm,
);

router.put(
    APP_ROUTER.TERM_SUBMIT_TOPIC,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    updateSubmitTopicTerm,
);

module.exports = router;
