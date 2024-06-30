const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getTranscriptByType,
    getTranscriptByGroupStudent,
    getTranscriptSummary,
    createTranscript,
    updateTranscript,
    unTranscriptStudentsByType,
} = require('../controllers/transcript.controller');
const { protectLecturer } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, protectLecturer, getTranscriptByType);

router.get(APP_ROUTER.TRANSCRIPT_BY_GROUP_STUDENT, protectLecturer, getTranscriptByGroupStudent);

router.get(APP_ROUTER.TRANSCRIPT_BY_SUMMARY, protectStudent, getTranscriptSummary);

router.post(APP_ROUTER.INDEX, protectLecturer, createTranscript);

router.put(APP_ROUTER.ID, protectLecturer, updateTranscript);

router.get(
    APP_ROUTER.LIST_STUDENT_NO_TRANSCRIPT_BY_LECTURER,
    protectLecturer,
    unTranscriptStudentsByType,
);

module.exports = router;
