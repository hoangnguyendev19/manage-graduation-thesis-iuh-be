const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    login,
    register,
    getLecturers,
    getLecturerById,
    changeRole,
    createLecturer,
    updatePassword,
} = require('../controller/lecturer/lecturer.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturerMiddleware');

const router = express.Router();

router.post(APP_ROUTER.LOGIN, login);

router.post(APP_ROUTER.REGISTER, register);

router.post(APP_ROUTER.INDEX, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), createLecturer);

router.get(APP_ROUTER.INDEX, getLecturers);

router.get(APP_ROUTER.LECTURER_BY_ID, getLecturerById);

router.put(APP_ROUTER.CHANGE_ROLE_LECTURE, protectLecturer, checkRoleLecturer('ADMIN'), changeRole);

router.put(APP_ROUTER.UPDATE_PASSWORD, protectLecturer, updatePassword);

module.exports = router;
