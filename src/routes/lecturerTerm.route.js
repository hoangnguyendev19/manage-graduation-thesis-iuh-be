const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getLecturerTerms,
    createLecturerTerm,
    updateRoleLecturerTerm,
    deleteLecturerTerm,
} = require('../controllers/lecturerTerm.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getLecturerTerms);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    createLecturerTerm,
);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    updateRoleLecturerTerm,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    deleteLecturerTerm,
);

module.exports = router;
