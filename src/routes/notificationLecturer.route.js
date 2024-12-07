const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    createNotificationLecturer,
    createAllNotificationLecturerTerms,
    updateReadStatus,
    getMyNotification,
    getNotificationById,
} = require('../controllers/notificationLecturer.controller');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const {
    validateNotificationLecturer,
    validateNotification,
} = require('../middleware/validation.middleware');
const router = express.Router();

router.get(APP_ROUTER.ME, protectLecturer, getMyNotification);

router.post(
    APP_ROUTER.NOTIFICATION_LECTURER_TERM,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateNotification,
    createAllNotificationLecturerTerms,
);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateNotificationLecturer,
    createNotificationLecturer,
);

router.put(APP_ROUTER.NOTIFICATION_LECTURER_READ, protectLecturer, updateReadStatus);

router.get(APP_ROUTER.ID, protectLecturer, getNotificationById);

module.exports = router;
