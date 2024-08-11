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
    exportStudents,
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
    forgotPassword,
    getStudentsNoHaveGroup,
    getStudentsOfSearch,
    searchStudents,
} = require('../controllers/student.controller');

const { protectStudent } = require('../middleware/student.middleware');
const { checkRole, protectLecturer } = require('../middleware/lecturer.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

router.post(APP_ROUTER.LOGIN, login);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

router.post(APP_ROUTER.FORGOT_PASSWORD, forgotPassword);

router.delete(APP_ROUTER.LOGOUT, protectStudent, logout);

router.get(APP_ROUTER.QUERY, getStudentsOfSearch);

router.get(APP_ROUTER.SEARCH, searchStudents);

router.get(APP_ROUTER.STUDENTS_NO_HAVE_GROUP, protectLecturer, getStudentsNoHaveGroup);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectStudent, updatePassword);

router.get(APP_ROUTER.ME, protectStudent, getMe);

router.put(APP_ROUTER.ME, protectStudent, updateMe);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    upload.single('file'),
    importStudents,
);

router.post(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    exportStudents,
);

router.post(
    APP_ROUTER.RESET_PASSWORD,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    resetPassword,
);

router.post(
    APP_ROUTER.LOCK,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    lockAccount,
);

router.put(
    APP_ROUTER.LOCK,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    lockAccounts,
);

router.post(
    APP_ROUTER.UNLOCK,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    unlockAccount,
);

router.put(
    APP_ROUTER.STUDENT_STATUS,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateStatus,
);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateStudent,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    deleteStudent,
);

router.get(APP_ROUTER.ID, getStudentById);

router.get(APP_ROUTER.INDEX, getStudents);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    createStudent,
);

module.exports = router;
