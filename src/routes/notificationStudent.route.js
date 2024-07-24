const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    getNotificationStudents,
    createNotificationStudent,
    updateNotificationStudent,
    updateReadStatus,
    deleteNotificationStudent,
    createAllNotificationStudentTerms,
    getMyNotification,
    getNotificationById,
} = require('../controllers/notificationStudent.controller');
const { protectStudent } = require('../middleware/student.middleware');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, protectStudent, getNotificationStudents);

router.get(APP_ROUTER.ME, protectStudent, getMyNotification);

router.get(APP_ROUTER.ID, protectStudent, getNotificationById);


router.post(
    APP_ROUTER.NOTIFICATION_STUDENT_TERM,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    createAllNotificationStudentTerms,
);

router.post(APP_ROUTER.INDEX, protectLecturer, createNotificationStudent);

router.put(APP_ROUTER.ID, protectLecturer, updateNotificationStudent);

router.put(APP_ROUTER.NOTIFICATION_STUDENT_READ, protectStudent, updateReadStatus);

router.delete(APP_ROUTER.ID, protectStudent, deleteNotificationStudent);

module.exports = router;
