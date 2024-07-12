const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    login,
    refreshToken,
    logout,
    getStudents,
    getStudentById,
    createStudent,
    importStudents,
    updateStudent,
    deleteStudent,
    resetPassword,
    lockAccount,
    lockAccounts,
    unlockAccount,
    updateStatus,
    updatePassword,
    getMe,
    updateMe,
    getStudentsNoHaveGroup,
} = require('../controllers/student.controller');

const { protectStudent } = require('../middleware/student.middleware');
const { checkRole, protectLecturer } = require('../middleware/lecturer.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

// ----------------- Auth -----------------
router.post(APP_ROUTER.LOGIN, login);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

router.delete(APP_ROUTER.LOGOUT, protectStudent, logout);

// ----------------- Admin -----------------
router.get(APP_ROUTER.INDEX, getStudents);

router.get(APP_ROUTER.STUDENTS_NO_HAVE_GROUP, protectLecturer, getStudentsNoHaveGroup);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    createStudent,
);

router.put(APP_ROUTER.ID, protectLecturer, updateStudent);

router.delete(APP_ROUTER.ID, protectLecturer, deleteStudent);

router.post(APP_ROUTER.IMPORT, protectLecturer, upload.single('file'), importStudents);

router.post(APP_ROUTER.RESET_PASSWORD, protectLecturer, resetPassword);

router.post(APP_ROUTER.LOCK, protectLecturer, lockAccount);

router.put(APP_ROUTER.LOCK, protectLecturer, lockAccounts);

router.post(APP_ROUTER.UNLOCK, protectLecturer, unlockAccount);

router.put(APP_ROUTER.STUDENT_STATUS, protectLecturer, updateStatus);

// ----------------- Student -----------------
router.get(APP_ROUTER.ME, protectStudent, getMe);

router.put(APP_ROUTER.ME, protectStudent, updateMe);

router.get(APP_ROUTER.ID, getStudentById);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectStudent, updatePassword);

module.exports = router;
