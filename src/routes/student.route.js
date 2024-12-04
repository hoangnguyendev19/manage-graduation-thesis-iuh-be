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
    exportTestStudents,
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
    countStudentsByTermId,
} = require('../controllers/student.controller');

const { protectStudent } = require('../middleware/student.middleware');
const { checkRole, protectLecturer } = require('../middleware/lecturer.middleware');
const {
    validateLogin,
    validateUpdatePassword,
    validateForgotPassword,
    validateStudent,
} = require('../middleware/validation.middleware');
const upload = require('../configs/uploadConfig');

const router = express.Router();

router.post(APP_ROUTER.LOGIN, validateLogin, login);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

router.post(APP_ROUTER.FORGOT_PASSWORD, validateForgotPassword, forgotPassword);

router.delete(APP_ROUTER.LOGOUT, protectStudent, logout);

router.get(APP_ROUTER.QUERY, protectLecturer, getStudentsOfSearch);

router.get(APP_ROUTER.SEARCH, searchStudents);

router.get(APP_ROUTER.STUDENTS_NO_HAVE_GROUP, protectLecturer, getStudentsNoHaveGroup);

router.get(APP_ROUTER.COUNT, countStudentsByTermId);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectStudent, validateUpdatePassword, updatePassword);

router.get(APP_ROUTER.ME, protectStudent, getMe);

router.put(APP_ROUTER.ME, protectStudent, updateMe);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    upload.single('file'),
    importStudents,
);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    exportStudents,
);

router.get(
    APP_ROUTER.STUDENT_EXPORT_TEST,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    exportTestStudents,
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

router.put(APP_ROUTER.STUDENT_STATUS, protectLecturer, updateStatus);

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

router.get(APP_ROUTER.ID, protectLecturer, getStudentById);

router.get(APP_ROUTER.INDEX, protectLecturer, getStudents);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateStudent,
    createStudent,
);

module.exports = router;
