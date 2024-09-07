const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getTranscriptByType,
    getTranscriptByGroupStudent,
    getTranscriptSummary,
    getTranscriptByStudent,
    createTranscriptList,
    updateTranscriptList,
    unTranscriptStudentsByType,
    getTranscriptGroupStudentByLecturerSupport,
    getGroupStudentMemberToScoring,
} = require('../controllers/transcript.controller');
const { protectLecturer } = require('../middleware/lecturer.middleware');
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

router.get(APP_ROUTER.TRANSCRIPT_BY_STUDENT, protectStudent, getTranscriptByStudent);

router.post(APP_ROUTER.LIST, protectLecturer, createTranscriptList);

router.put(APP_ROUTER.LIST, protectLecturer, updateTranscriptList);

router.get(
    APP_ROUTER.LIST_STUDENT_NO_TRANSCRIPT_BY_LECTURER,
    protectLecturer,
    unTranscriptStudentsByType,
);

router.get(APP_ROUTER.INDEX, protectLecturer, getTranscriptByType);

module.exports = router;
