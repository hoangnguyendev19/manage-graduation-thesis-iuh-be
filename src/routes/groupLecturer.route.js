const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupLecturers,
    getGroupLecturerById,
    updateGroupLecturer,
    deleteGroupLecturer,
    addLecturerToGroupLecturer,
    removeLecturerFromGroupLecturer,
    getLecturerNoGroupByType,
    createGroupLecturerByType,
    addMemberToGroupLecturer,
    getMemberFromGroupLecturer,
} = require('../controllers/groupLecturer.controller');

const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');
const {
    isExistLecturerInGroup,
    quantityOfGroup,
} = require('../middleware/groupLecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.GROUP_LECTURER_NO_GROUP, getLecturerNoGroupByType);

router.get(APP_ROUTER.INDEX, getGroupLecturers);

router.get(APP_ROUTER.ID, getGroupLecturerById);

router.get(APP_ROUTER.GROUP_LECTURER_MEMBER, getMemberFromGroupLecturer);

router.post(
    APP_ROUTER.GROUP_LECTURER_BY_TYPE,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    createGroupLecturerByType,
);

router.put(APP_ROUTER.ID, protectLecturer, checkRoleLecturer('HEAD_LECTURER'), updateGroupLecturer);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    deleteGroupLecturer,
);

router.post(
    APP_ROUTER.GROUP_LECTURER_MEMBER,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    isExistLecturerInGroup,
    quantityOfGroup,
    addMemberToGroupLecturer,
);

router.delete(
    APP_ROUTER.GROUP_LECTURER_MEMBER,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    removeLecturerFromGroupLecturer,
);

module.exports = router;
