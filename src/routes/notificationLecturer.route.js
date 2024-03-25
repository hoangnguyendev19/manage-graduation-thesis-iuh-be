const express = require('express');
const { APP_ROUTER } = require('../constants/router');

const {
    getNotificationLecturers,
    createNotificationLecturer,
    updateNotificationLecturer,
    updateReadStatus,
    deleteNotificationLecturer,
} = require('../controllers/notificationLecturer.controller');
const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, protectLecturer, getNotificationLecturers);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    createNotificationLecturer,
);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    updateNotificationLecturer,
);

router.put(APP_ROUTER.NOTIFICATION_LECTURER_READ, protectLecturer, updateReadStatus);

router.delete(APP_ROUTER.ID, protectLecturer, deleteNotificationLecturer);

module.exports = router;
