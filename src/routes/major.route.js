const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    createMajor,
    getMajors,
    getMajorById,
    updateMajor,
    deleteMajor,
} = require('../controllers/major.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getMajors);

router.get(APP_ROUTER.ID, getMajorById);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('ADMIN'), createMajor);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('ADMIN'), updateMajor);

router.delete(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('ADMIN'), deleteMajor);

module.exports = router;
