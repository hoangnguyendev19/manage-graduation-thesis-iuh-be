const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    login,
    refreshToken,
    logout,
    getLecturers,
    getLecturerById,
    changeRole,
    createLecturer,
    updateLecturer,
    importLecturers,
    deleteLecturer,
    updatePassword,
    getMe,
    updateMe,
    getLecturersByParams,
} = require('../controllers/lecturer.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

// ----------------- Auth -----------------
router.post(APP_ROUTER.LOGIN, login);

router.delete(APP_ROUTER.LOGOUT, protectLecturer, logout);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

// ----------------- Admin -----------------
router.get(APP_ROUTER.INDEX, getLecturers);

router.get(APP_ROUTER.PARAMS, getLecturersByParams);

router.get(APP_ROUTER.ID, getLecturerById);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), createLecturer);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateLecturer);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    upload.single('file'),
    importLecturers,
);

router.delete(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), deleteLecturer);

router.put(APP_ROUTER.CHANGE_ROLE_LECTURE, protectLecturer, checkRoleLecturer('ADMIN'), changeRole);

// ----------------- Lecturer -----------------
router.get(APP_ROUTER.ME, protectLecturer, getMe);

router.put(APP_ROUTER.ME, protectLecturer, updateMe);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectLecturer, updatePassword);

module.exports = router;
