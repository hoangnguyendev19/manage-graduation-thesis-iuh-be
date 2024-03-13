const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupLecturers,
    getGroupLecturerById,
    createGroupLecturer,
    updateGroupLecturer,
    deleteGroupLecturer,
    addLecturerToGroupLecturer,
    removeLecturerFromGroupLecturer,
} = require('../controller/groupLecturer/groupLecturer.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getGroupLecturers);

router.get(APP_ROUTER.ID, getGroupLecturerById);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    createGroupLecturer,
);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateGroupLecturer);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    deleteGroupLecturer,
);

router.post(
    APP_ROUTER.GROUP_LECTURER_MEMBERS,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    addLecturerToGroupLecturer,
);

router.delete(
    APP_ROUTER.GROUP_LECTURER_MEMBERS,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    removeLecturerFromGroupLecturer,
);

module.exports = router;
