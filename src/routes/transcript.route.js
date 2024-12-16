const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getTranscriptByTypeEvaluation,
    getTranscriptByGroupStudent,
    getTranscriptSummary,
    getTranscriptByStudentId,
    exportTranscripts,
    createTranscriptList,
    updateTranscriptList,
    getTranscriptGroupStudentByLecturerSupport,
    getGroupStudentMemberToScoring,
    getStatisticTranscript,
    getTranscriptsByTypeAssign,
    exportAllTranscripts,
} = require('../controllers/transcript.controller');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');

const router = express.Router();

router.get(APP_ROUTER.TRANSCRIPT_BY_GROUP_STUDENT, protectLecturer, getTranscriptByGroupStudent);

router.get(APP_ROUTER.TRANSCRIPT_BY_SUMMARY, protectStudent, getTranscriptSummary);

router.get(
    APP_ROUTER.TRANSCRIPT_BY_LECTURER_SUPPORT,
    protectLecturer,
    getTranscriptGroupStudentByLecturerSupport,
);

router.get(
    APP_ROUTER.TRANSCRIPT_GROUP_STUDENT_TO_SCORING,
    protectLecturer,
    getGroupStudentMemberToScoring,
);

router.get(APP_ROUTER.TRANSCRIPT_BY_TYPE_ASSIGN, protectLecturer, getTranscriptsByTypeAssign);

router.get(
    APP_ROUTER.TRANSCRIPT_BY_ALL,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    exportAllTranscripts,
);

router.get(APP_ROUTER.TRANSCRIPT_STATISTIC, protectLecturer, getStatisticTranscript);

router.get(APP_ROUTER.TRANSCRIPT_BY_STUDENT, protectStudent, getTranscriptByStudentId);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    exportTranscripts,
);

router.post(APP_ROUTER.LIST, protectLecturer, createTranscriptList);

router.put(APP_ROUTER.LIST, protectLecturer, updateTranscriptList);

router.get(APP_ROUTER.INDEX, protectLecturer, getTranscriptByTypeEvaluation);

module.exports = router;
