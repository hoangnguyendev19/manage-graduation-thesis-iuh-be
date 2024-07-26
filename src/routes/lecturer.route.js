const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    login,
    refreshToken,
    logout,
    getLecturers,
    getLecturersByMajorId,
    getLecturerById,
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
    searchLecturer,
} = require('../controllers/lecturer.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const upload = require('../configs/uploadConfig');
const { check } = require('express-validator');

const router = express.Router();

router.post(APP_ROUTER.LOGIN, login);

router.delete(APP_ROUTER.LOGOUT, protectLecturer, logout);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

router.get(APP_ROUTER.ME, protectLecturer, getMe);

router.get(
    APP_ROUTER.QUERY,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    searchLecturer,
);

router.get(APP_ROUTER.INDEX, getLecturers);

router.get(APP_ROUTER.LECTURER_BY_MAJOR, getLecturersByMajorId);

router.get(APP_ROUTER.ID, getLecturerById);

router.post(APP_ROUTER.IMPORT, protectLecturer, upload.single('file'), importLecturers);

router.post(APP_ROUTER.RESET_PASSWORD, protectLecturer, resetPassword);

router.post(APP_ROUTER.LOCK, protectLecturer, lockAccount);

router.post(APP_ROUTER.UNLOCK, protectLecturer, unlockAccount);

// router.post(APP_ROUTER.INDEX, protectLecturer, createLecturer);
router.post(APP_ROUTER.INDEX, createLecturer);

router.put(APP_ROUTER.ME, protectLecturer, updateMe);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectLecturer, updatePassword);

router.put(APP_ROUTER.ID, protectLecturer, updateLecturer);

router.delete(APP_ROUTER.ID, protectLecturer, deleteLecturer);

module.exports = router;
