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
    resetPassword,
    lockAccount,
    unlockAccount,
    updatePassword,
    getMe,
    updateMe,
} = require('../controllers/lecturer.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

// ----------------- Auth -----------------
router.post(APP_ROUTER.LOGIN, login);

router.delete(APP_ROUTER.LOGOUT, protectLecturer, logout);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

// ----------------- Admin -----------------
router.get(APP_ROUTER.ME, protectLecturer, getMe);

router.get(APP_ROUTER.INDEX, getLecturers);

router.get(APP_ROUTER.ID, getLecturerById);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), createLecturer);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateLecturer);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRoleLecturer('ADMIN'),
    upload.single('file'),
    importLecturers,
);

router.delete(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), deleteLecturer);

router.post(APP_ROUTER.RESET_PASSWORD, protectLecturer, checkRoleLecturer('ADMIN'), resetPassword);

router.put(APP_ROUTER.CHANGE_ROLE_LECTURE, protectLecturer, checkRoleLecturer('ADMIN'), changeRole);

router.post(APP_ROUTER.LOCK, protectLecturer, checkRoleLecturer('ADMIN'), lockAccount);

router.post(APP_ROUTER.UNLOCK, protectLecturer, checkRoleLecturer('ADMIN'), unlockAccount);

// ----------------- Lecturer -----------------

router.put(APP_ROUTER.ME, protectLecturer, updateMe);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectLecturer, updatePassword);

module.exports = router;
