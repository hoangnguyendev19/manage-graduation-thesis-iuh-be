const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    login,
    refreshToken,
    logout,
    getStudents,
    getStudentById,
    createStudent,
    updatePassword,
    getMe,
    updateMe,
} = require('../controllers/student.controller');

const { protectStudent } = require('../middleware/student.middleware');
const { checkRoleLecturer, protectLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.post(APP_ROUTER.LOGIN, login);

router.post(APP_ROUTER.REFRESH_TOKEN, refreshToken);

router.delete(APP_ROUTER.LOGOUT, protectStudent, logout);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), createStudent);

router.get(APP_ROUTER.ME, protectStudent, getMe);

router.get(APP_ROUTER.INDEX, getStudents);

router.get(APP_ROUTER.ID, getStudentById);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectStudent, updatePassword);

router.put(APP_ROUTER.ME, protectStudent, updateMe);

module.exports = router;
