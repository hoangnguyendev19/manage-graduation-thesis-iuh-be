const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupLecturers,
    getGroupLecturerById,
    updateGroupLecturer,
    deleteGroupLecturer,
    removeLecturerFromGroupLecturer,
    getLecturerNoGroupByType,
    createGroupLecturerByType,
    addMemberToGroupLecturer,
    getMemberFromGroupLecturer,
    getGroupLecturersByLecturerId,
} = require('../controllers/groupLecturer.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { validateGroupLecturer } = require('../middleware/validation.middleware');

const router = express.Router();

router.get(APP_ROUTER.GROUP_LECTURER_NO_GROUP, getLecturerNoGroupByType);

router.get(APP_ROUTER.GROUP_LECTURER_BY_LECTURERS, protectLecturer, getGroupLecturersByLecturerId);

router.get(APP_ROUTER.GROUP_LECTURER_MEMBER, getMemberFromGroupLecturer);

router.post(
    APP_ROUTER.GROUP_LECTURER_BY_TYPE,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    validateGroupLecturer,
    createGroupLecturerByType,
);

router.post(
    APP_ROUTER.GROUP_LECTURER_MEMBER,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    addMemberToGroupLecturer,
);

router.put(
    APP_ROUTER.GROUP_LECTURER_MEMBER,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    removeLecturerFromGroupLecturer,
);

router.get(APP_ROUTER.ID, getGroupLecturerById);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    updateGroupLecturer,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    deleteGroupLecturer,
);

router.get(APP_ROUTER.INDEX, getGroupLecturers);

module.exports = router;
