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

router.post(APP_ROUTER.IMPORT, protectLecturer, importLecturerTerms);

router.get(APP_ROUTER.LIST, protectLecturer, getLecturerTermsList);

router.get(
    APP_ROUTER.QUERY,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    searchLecturerTerms,
);

router.get(
    APP_ROUTER.LECTURER_TERM_TO_ADDING,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    getLecturerTermsToAdding,
);
router.post(APP_ROUTER.INDEX, protectLecturer, createLecturerTerm);

router.delete(APP_ROUTER.INDEX, deleteLecturerTerm);

module.exports = router;
