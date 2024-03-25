const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    login,
    register,
    refreshToken,
    getLecturers,
    getLecturerById,
    changeRole,
    createLecturer,
    updatePassword,
    getMe,
    updateMe,
} = require('../controllers/lecturer.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.post(APP_ROUTER.LOGIN, login);

router.post(APP_ROUTER.REGISTER, register);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), createLecturer);

router.get(APP_ROUTER.ME, protectLecturer, getMe);

router.get(APP_ROUTER.INDEX, getLecturers);

router.get(APP_ROUTER.ID, getLecturerById);

router.put(APP_ROUTER.CHANGE_ROLE_LECTURE, protectLecturer, checkRoleLecturer('ADMIN'), changeRole);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectLecturer, updatePassword);

router.put(APP_ROUTER.ME, protectLecturer, updateMe);

module.exports = router;
