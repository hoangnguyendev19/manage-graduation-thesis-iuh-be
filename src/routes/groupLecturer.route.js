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

const router = express.Router();

router.get(APP_ROUTER.GROUP_LECTURER_NO_GROUP, getLecturerNoGroupByType);

router.get(APP_ROUTER.GROUP_LECTURER_BY_LECTURERS, protectLecturer, getGroupLecturersByLecturerId);

router.get(APP_ROUTER.INDEX, getGroupLecturers);

router.get(APP_ROUTER.ID, getGroupLecturerById);

router.get(APP_ROUTER.GROUP_LECTURER_MEMBER, getMemberFromGroupLecturer);

router.post(APP_ROUTER.GROUP_LECTURER_BY_TYPE, protectLecturer, createGroupLecturerByType);

router.put(APP_ROUTER.ID, protectLecturer, updateGroupLecturer);

router.delete(APP_ROUTER.ID, protectLecturer, deleteGroupLecturer);

router.post(APP_ROUTER.GROUP_LECTURER_MEMBER, protectLecturer, addMemberToGroupLecturer);

router.put(APP_ROUTER.GROUP_LECTURER_MEMBER, protectLecturer, removeLecturerFromGroupLecturer);

module.exports = router;
