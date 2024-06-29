const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getEvaluations,
    getEvaluationById,
    createEvaluation,
    importEvaluations,
    updateEvaluation,
    deleteEvaluation,
    getEvaluationsForScoring,
} = require('../controllers/evaluation.controller');
const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getEvaluations);
router.get(APP_ROUTER.SCORES, getEvaluationsForScoring);

router.get(APP_ROUTER.ID, getEvaluationById);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    createEvaluation,
);

router.post(
    APP_ROUTER.IMPORT,
    // protectLecturer,
    // checkRoleLecturer('HEAD_LECTURER'),
    upload.single('file'),
    importEvaluations,
);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateEvaluation);

router.delete(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), deleteEvaluation);

module.exports = router;
