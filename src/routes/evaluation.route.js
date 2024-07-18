const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getEvaluations,
    getEvaluationById,
    createEvaluation,
    importEvaluations,
    importEvaluationsFromTermIdToSelectedTermId,
    updateEvaluation,
    deleteEvaluation,
    getEvaluationsForScoring,
} = require('../controllers/evaluation.controller');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getEvaluations);

router.get(APP_ROUTER.SCORES, getEvaluationsForScoring);

router.get(APP_ROUTER.ID, getEvaluationById);

router.post(APP_ROUTER.INDEX, protectLecturer, createEvaluation);

router.post(APP_ROUTER.IMPORT, protectLecturer, upload.single('file'), importEvaluations);

router.post(
    APP_ROUTER.IMPORT_FROM_SELECT,
    protectLecturer,
    importEvaluationsFromTermIdToSelectedTermId,
);

router.put(APP_ROUTER.ID, protectLecturer, updateEvaluation);

router.delete(APP_ROUTER.ID, protectLecturer, deleteEvaluation);

module.exports = router;
