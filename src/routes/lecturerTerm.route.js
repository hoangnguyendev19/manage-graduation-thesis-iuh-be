const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    importLecturerTerms,
    getLecturerTermsList,
    deleteLecturerTerm,
    getLecturerTermsToAdding,
    createLecturerTerm,
    searchLecturerTerms,
} = require('../controllers/lecturerTerm.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    importLecturerTerms,
);

router.get(APP_ROUTER.LIST, protectLecturer, getLecturerTermsList);

router.get(APP_ROUTER.QUERY, protectLecturer, searchLecturerTerms);

router.get(APP_ROUTER.LECTURER_TERM_TO_ADDING, protectLecturer, getLecturerTermsToAdding);
router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    createLecturerTerm,
);

router.delete(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    deleteLecturerTerm,
);

module.exports = router;
