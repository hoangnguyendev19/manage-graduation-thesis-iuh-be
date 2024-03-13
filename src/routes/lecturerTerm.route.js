const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getLecturerTerms,
    createLecturerTerm,
    updateRoleLecturerTerm,
    deleteLecturerTerm,
} = require('../controller/lecturerTerm/lecturerTerm.controller');

const { protectLecturer } = require('../middleware/lecturerMiddleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, protectLecturer, getLecturerTerms);

router.post(APP_ROUTER.INDEX, protectLecturer, createLecturerTerm);

router.put(APP_ROUTER.ID, protectLecturer, updateRoleLecturerTerm);

router.delete(APP_ROUTER.ID, protectLecturer, deleteLecturerTerm);

module.exports = router;
