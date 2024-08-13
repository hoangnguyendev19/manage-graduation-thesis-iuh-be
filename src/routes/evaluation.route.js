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
const { validateEvaluation } = require('../middleware/validation.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

router.get(APP_ROUTER.SCORES, getEvaluationsForScoring);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    upload.single('file'),
    importEvaluations,
);

router.post(
    APP_ROUTER.IMPORT_FROM_SELECT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    importEvaluationsFromTermIdToSelectedTermId,
);

router.get(APP_ROUTER.ID, getEvaluationById);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    validateEvaluation,
    updateEvaluation,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    deleteEvaluation,
);

router.get(APP_ROUTER.INDEX, getEvaluations);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    validateEvaluation,
    createEvaluation,
);

module.exports = router;
