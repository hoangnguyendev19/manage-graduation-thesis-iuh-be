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
const { validateNotification } = require('../middleware/validation.middleware');
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

router.get(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    getNotifications,
);

router.get(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    getNotificationById,
);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateNotification,
    createNotification,
);

module.exports = router;
