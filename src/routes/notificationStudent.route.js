const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    createNotificationStudent,
    createNotificationGroupStudent,
    createAllNotificationStudentTerms,
    updateReadStatus,
    getMyNotification,
    getNotificationById,
} = require('../controllers/notificationStudent.controller');
const { protectStudent } = require('../middleware/student.middleware');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const {
    validateNotificationStudent,
    validateNotificationGroupStudent,
    validateNotification,
} = require('../middleware/validation.middleware');

const router = express.Router();

router.get(APP_ROUTER.ME, protectStudent, getMyNotification);

router.post(
    APP_ROUTER.NOTIFICATION_STUDENT_TERM,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateNotification,
    createAllNotificationStudentTerms,
);

router.post(
    APP_ROUTER.NOTIFICATION_GROUP_STUDENT,
    protectLecturer,
    validateNotificationGroupStudent,
    createNotificationGroupStudent,
);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    validateNotificationStudent,
    createNotificationStudent,
);

router.put(APP_ROUTER.NOTIFICATION_STUDENT_READ, protectStudent, updateReadStatus);

router.get(APP_ROUTER.ID, protectStudent, getNotificationById);

module.exports = router;
