const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    getNotificationStudents,
    createNotificationStudent,
    updateReadStatus,
    deleteNotificationStudent,
    createAllNotificationStudentTerms,
    getMyNotification,
    getNotificationById,
} = require('../controllers/notificationStudent.controller');
const { protectStudent } = require('../middleware/student.middleware');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.ME, protectStudent, getMyNotification);

router.post(
    APP_ROUTER.NOTIFICATION_STUDENT_TERM,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    createAllNotificationStudentTerms,
);

router.put(APP_ROUTER.NOTIFICATION_STUDENT_READ, protectStudent, updateReadStatus);

router.get(APP_ROUTER.ID, protectStudent, getNotificationById);

router.delete(APP_ROUTER.ID, protectStudent, deleteNotificationStudent);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    createNotificationStudent,
);

router.get(APP_ROUTER.INDEX, protectStudent, getNotificationStudents);

module.exports = router;
