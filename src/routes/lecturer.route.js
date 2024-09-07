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
    exportLecturers,
    deleteLecturer,
    resetPassword,
    lockAccount,
    unlockAccount,
    updatePassword,
    getMe,
    updateMe,
    forgotPassword,
    searchLecturer,
    countLecturersByMajorId,
} = require('../controllers/lecturer.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const {
    validateLogin,
    validateUpdatePassword,
    validateForgotPassword,
    validateLecturer,
} = require('../middleware/validation.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

router.post(APP_ROUTER.LOGIN, validateLogin, login);

router.post(APP_ROUTER.FORGOT_PASSWORD, validateForgotPassword, forgotPassword);

router.delete(APP_ROUTER.LOGOUT, protectLecturer, logout);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

router.get(APP_ROUTER.ME, protectLecturer, getMe);

router.get(APP_ROUTER.QUERY, protectLecturer, searchLecturer);

router.get(APP_ROUTER.LECTURER_BY_MAJOR, getLecturersByMajorId);

router.get(APP_ROUTER.COUNT, countLecturersByMajorId);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    upload.single('file'),
    importLecturers,
);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    exportLecturers,
);

router.post(
    APP_ROUTER.RESET_PASSWORD,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    resetPassword,
);

router.post(APP_ROUTER.LOCK, protectLecturer, checkRole(['ADMIN', 'HEAD_LECTURER']), lockAccount);

router.post(
    APP_ROUTER.UNLOCK,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    unlockAccount,
);

router.put(APP_ROUTER.ME, protectLecturer, updateMe);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectLecturer, validateUpdatePassword, updatePassword);

router.put(APP_ROUTER.ID, protectLecturer, checkRole(['ADMIN', 'HEAD_LECTURER']), updateLecturer);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    deleteLecturer,
);

router.get(APP_ROUTER.ID, getLecturerById);

router.get(APP_ROUTER.INDEX, getLecturers);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    validateLecturer,
    createLecturer,
);

module.exports = router;
