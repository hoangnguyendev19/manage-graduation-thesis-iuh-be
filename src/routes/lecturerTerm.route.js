const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    importLecturerTerms,
    getLecturerTermsList,
} = require('../controllers/lecturerTerm.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.post(APP_ROUTER.IMPORT, protectLecturer, importLecturerTerms);

router.get(APP_ROUTER.LIST, protectLecturer, getLecturerTermsList);

module.exports = router;
