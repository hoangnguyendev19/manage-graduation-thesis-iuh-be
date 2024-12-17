const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    createMajor,
    getMajors,
    getMajorById,
    updateMajor,
    deleteMajor,
} = require('../controllers/major.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { validateMajor } = require('../middleware/validation.middleware');

const router = express.Router();

router.get(APP_ROUTER.ID, protectLecturer, getMajorById);

router.put(APP_ROUTER.ID, protectLecturer, checkRole(['ADMIN']), validateMajor, updateMajor);

router.delete(APP_ROUTER.ID, protectLecturer, checkRole(['ADMIN']), deleteMajor);

router.get(APP_ROUTER.INDEX, protectLecturer, getMajors);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRole(['ADMIN']), validateMajor, createMajor);

module.exports = router;
