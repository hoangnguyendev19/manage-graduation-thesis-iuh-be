const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const { importLecturerTerms } = require('../controllers/lecturerTerm.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.post(APP_ROUTER.IMPORT, protectLecturer, checkRoleLecturer('ADMIN'), importLecturerTerms);

module.exports = router;
