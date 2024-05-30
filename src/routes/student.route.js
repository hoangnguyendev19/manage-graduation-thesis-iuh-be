const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    login,
    refreshToken,
    logout,
    getStudents,
    getStudentsByParams,
    getStudentById,
    createStudent,
    importStudents,
    updateStudent,
    deleteStudent,
    resetPassword,
    updatePassword,
    getMe,
    updateMe,
} = require('../controllers/student.controller');

const { protectStudent } = require('../middleware/student.middleware');
const { checkRoleLecturer, protectLecturer } = require('../middleware/lecturer.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

// ----------------- Auth -----------------
router.post(APP_ROUTER.LOGIN, login);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

router.delete(APP_ROUTER.LOGOUT, protectStudent, logout);

// ----------------- Admin -----------------
router.get(APP_ROUTER.INDEX, getStudents);

router.get(APP_ROUTER.PARAMS, getStudentsByParams);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), createStudent);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateStudent);

router.delete(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), deleteStudent);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    upload.single('file'),
    importStudents,
);

router.post(
    APP_ROUTER.RESET_PASSWORD,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    resetPassword,
);

// ----------------- Student -----------------
router.get(APP_ROUTER.ME, protectStudent, getMe);

router.put(APP_ROUTER.ME, protectStudent, updateMe);

router.get(APP_ROUTER.ID, getStudentById);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectStudent, updatePassword);

module.exports = router;
