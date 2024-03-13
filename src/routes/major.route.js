const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    createMajor,
    getMajors,
    getMajorById,
    updateMajor,
    deleteMajor,
} = require('../controller/major/major.controller');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getMajors);

router.get(APP_ROUTER.MAJORS_BY_ID, getMajorById);

router.post(APP_ROUTER.INDEX, createMajor);

router.put(APP_ROUTER.MAJORS_BY_ID, updateMajor);

router.delete(APP_ROUTER.MAJORS_BY_ID, deleteMajor);

module.exports = router;
