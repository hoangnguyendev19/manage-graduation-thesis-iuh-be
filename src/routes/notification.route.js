const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    getNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    getNotificationById,
} = require('../controllers/notification.controller');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const router = express.Router();

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateNotification,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    deleteNotification,
);

router.get(APP_ROUTER.ID, protectLecturer, getNotificationById);

router.get(APP_ROUTER.INDEX, protectLecturer, getNotifications);

module.exports = router;
