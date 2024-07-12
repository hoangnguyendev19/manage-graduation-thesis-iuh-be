const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    importLecturerTerms,
    getLecturerTermsList,
    deleteLecturerTerm,
} = require('../controllers/lecturerTerm.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.post(APP_ROUTER.IMPORT, protectLecturer, checkRoleLecturer('ADMIN'), importLecturerTerms);

router.get(APP_ROUTER.LIST, protectLecturer, checkRoleLecturer('ADMIN'), getLecturerTermsList);

router.delete(APP_ROUTER.INDEX, deleteLecturerTerm);

module.exports = router;
