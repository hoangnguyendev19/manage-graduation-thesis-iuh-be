const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    getNotificationStudents,
    createNotificationStudent,
    updateNotificationStudent,
    updateReadStatus,
    deleteNotificationStudent,
} = require('../controller/notificationStudent/notificationStudent.controller');
const { protectStudent } = require('../middleware/student.middleware');
const { protectLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, protectStudent, getNotificationStudents);

router.post(APP_ROUTER.INDEX, protectLecturer, createNotificationStudent);

router.put(APP_ROUTER.ID, protectLecturer, updateNotificationStudent);

router.put(APP_ROUTER.NOTIFICATION_STUDENT_READ, protectStudent, updateReadStatus);

router.delete(APP_ROUTER.ID, protectStudent, deleteNotificationStudent);

module.exports = router;
