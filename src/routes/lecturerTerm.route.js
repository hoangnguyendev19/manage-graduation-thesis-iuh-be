const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    importLecturerTerms,
    exportLecturerTerms,
    getLecturerTerms,
    getLecturerTermById,
    deleteLecturerTerm,
    getLecturerTermsToAdding,
    createLecturerTerm,
    searchLecturerTerms,
    countLecturerTermsByTermId,
} = require('../controllers/lecturerTerm.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { validateLecturerTerm } = require('../middleware/validation.middleware');

const router = express.Router();

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    importLecturerTerms,
);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    exportLecturerTerms,
);

router.get(APP_ROUTER.QUERY, protectLecturer, searchLecturerTerms);

router.get(APP_ROUTER.LECTURER_TERM_TO_ADDING, protectLecturer, getLecturerTermsToAdding);

router.get(APP_ROUTER.COUNT, countLecturerTermsByTermId);

router.get(APP_ROUTER.ID, protectLecturer, getLecturerTermById);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    validateLecturerTerm,
    createLecturerTerm,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    deleteLecturerTerm,
);

router.get(APP_ROUTER.INDEX, protectLecturer, getLecturerTerms);

module.exports = router;
