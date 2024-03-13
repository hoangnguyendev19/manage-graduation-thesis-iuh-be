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

router.get(APP_ROUTER.ID, getMajorById);

router.post(APP_ROUTER.INDEX, createMajor);

router.put(APP_ROUTER.ID, updateMajor);

router.delete(APP_ROUTER.ID, deleteMajor);

module.exports = router;
