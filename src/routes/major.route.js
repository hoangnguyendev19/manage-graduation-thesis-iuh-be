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

const router = express.Router();

router.get(APP_ROUTER.ID, getMajorById);

router.put(APP_ROUTER.ID, protectLecturer, checkRole(['ADMIN']), updateMajor);

router.delete(APP_ROUTER.ID, protectLecturer, checkRole(['ADMIN']), deleteMajor);

router.get(APP_ROUTER.INDEX, getMajors);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRole(['ADMIN']), createMajor);

module.exports = router;
