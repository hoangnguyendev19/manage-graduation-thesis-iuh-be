const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    login,
    register,
    refreshToken,
    logout,
    getLecturers,
    getLecturerById,
    changeRole,
    createLecturer,
    updateLecturer,
    deleteLecturer,
    updatePassword,
    getMe,
    updateMe,
} = require('../controllers/lecturer.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

// ----------------- Auth -----------------
router.post(APP_ROUTER.LOGIN, login);

router.post(APP_ROUTER.REGISTER, register);

router.delete(APP_ROUTER.LOGOUT, protectLecturer, logout);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

// ----------------- Admin -----------------
router.get(APP_ROUTER.INDEX, getLecturers);

router.get(APP_ROUTER.ID, getLecturerById);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), createLecturer);

router.put(APP_ROUTER.CHANGE_ROLE_LECTURE, protectLecturer, checkRoleLecturer('ADMIN'), changeRole);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateLecturer);

router.delete(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), deleteLecturer);

// ----------------- Lecturer -----------------
router.get(APP_ROUTER.ME, protectLecturer, getMe);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectLecturer, updatePassword);

router.put(APP_ROUTER.ME, protectLecturer, updateMe);

module.exports = router;
