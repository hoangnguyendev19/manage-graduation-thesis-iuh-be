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
const upload = require('../configs/upload.config');

const router = express.Router();

router.post(
    APP_ROUTER.IMPORT_FROM_SELECT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    importEvaluationsFromTermIdToSelectedTermId,
);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    upload.single('file'),
    importEvaluations,
);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateEvaluation,
    createEvaluation,
);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateEvaluation,
    updateEvaluation,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    deleteEvaluation,
);

router.get(APP_ROUTER.EVALUATION_SCORES, protectLecturer, getEvaluationsForScoring);

router.get(APP_ROUTER.ID, getEvaluationById);

router.get(APP_ROUTER.INDEX, getEvaluations);

module.exports = router;
