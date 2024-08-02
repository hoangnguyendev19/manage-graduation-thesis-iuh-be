const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    getNotificationLecturers,
    createNotificationLecturer,
    updateReadStatus,
    deleteNotificationLecturer,
    createAllNotificationLecturerTerms,
    getMyNotification,
    getNotificationById,
} = require('../controllers/notificationLecturer.controller');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.ME, protectLecturer, getMyNotification);

router.post(
    APP_ROUTER.NOTIFICATION_LECTURER_TERM,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    createAllNotificationLecturerTerms,
);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    createNotificationLecturer,
);

router.put(APP_ROUTER.NOTIFICATION_LECTURER_READ, protectLecturer, updateReadStatus);

router.get(APP_ROUTER.ID, protectLecturer, getNotificationById);

router.delete(APP_ROUTER.ID, protectLecturer, deleteNotificationLecturer);

router.get(APP_ROUTER.INDEX, protectLecturer, getNotificationLecturers);

module.exports = router;
