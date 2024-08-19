const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    createNotificationLecturer,
    createNotificationGroupLecturer,
    createAllNotificationLecturerTerms,
    updateReadStatus,
    getMyNotification,
    getNotificationById,
} = require('../controllers/notificationLecturer.controller');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const {
    validateNotificationLecturer,
    validateNotificationGroupLecturer,
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

router.post(
    APP_ROUTER.NOTIFICATION_GROUP_LECTURER,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateNotificationGroupLecturer,
    createNotificationGroupLecturer,
);

router.put(APP_ROUTER.NOTIFICATION_LECTURER_READ, protectLecturer, updateReadStatus);

router.get(APP_ROUTER.ID, protectLecturer, getNotificationById);

module.exports = router;
