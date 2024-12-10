const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getEvents,
    getEventById,
    getEventsByGroupStudentId,
    createEvent,
    updateEvent,
    deleteEvent,
    submitEvent,
    commentEvent,
} = require('../controllers/event.controller');

const { protectLecturer } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');

const upload = require('../configs/uploadTempConfig');

const router = express.Router();

router.put(APP_ROUTER.EVENT_BY_COMMENT, protectLecturer, commentEvent);

router.put(APP_ROUTER.EVENT_BY_SUBMIT, protectStudent, upload.single('file'), submitEvent);

router.delete(APP_ROUTER.ID, protectLecturer, deleteEvent);

router.put(APP_ROUTER.ID, protectLecturer, updateEvent);

router.post(APP_ROUTER.INDEX, protectLecturer, createEvent);

router.get(APP_ROUTER.EVENT_BY_GROUP_STUDENT, protectStudent, getEventsByGroupStudentId);

router.get(APP_ROUTER.ID, protectLecturer, getEventById);

router.get(APP_ROUTER.INDEX, protectLecturer, getEvents);

module.exports = router;
