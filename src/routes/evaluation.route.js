const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getEvaluations,
    getEvaluationById,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
} = require('../controllers/evaluation.controller');
const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');
const router = express.Router();

router.get(APP_ROUTER.INDEX, getEvaluations);

router.get(APP_ROUTER.ID, getEvaluationById);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    createEvaluation,
);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateEvaluation);

router.delete(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), deleteEvaluation);

module.exports = router;
