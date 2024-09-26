const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupLecturers,
    getGroupLecturersByLecturerId,
    getGroupLecturersByTypeEvaluation,
    getGroupLecturersByTypeEvaluationAndLecturerId,
    getGroupLecturerById,
    updateGroupLecturer,
    deleteGroupLecturer,
    removeLecturerFromGroupLecturer,
    getLecturerNoGroupByType,
    createGroupLecturer,
    addMemberToGroupLecturer,
    getMemberFromGroupLecturer,
    countGroupLecturersByTermId,
    countGroupLecturersByLecturerId,
    searchGroupLecturerByName,
} = require('../controllers/groupLecturer.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { validateGroupLecturer } = require('../middleware/validation.middleware');

const router = express.Router();

router.get(APP_ROUTER.GROUP_LECTURER_NO_GROUP, getLecturerNoGroupByType);

router.get(APP_ROUTER.GROUP_LECTURER_BY_LECTURER, getGroupLecturersByLecturerId);

router.get(APP_ROUTER.GROUP_LECTURER_EVALUATION, getGroupLecturersByTypeEvaluation);

router.get(
    APP_ROUTER.GROUP_LECTURER_EVALUATION_LECTURER,
    getGroupLecturersByTypeEvaluationAndLecturerId,
);

router.get(APP_ROUTER.GROUP_LECTURER_MEMBER, getMemberFromGroupLecturer);

router.get(APP_ROUTER.COUNT, countGroupLecturersByTermId);

router.get(APP_ROUTER.COUNT_BY_LECTURER, protectLecturer, countGroupLecturersByLecturerId);

router.get(APP_ROUTER.SEARCH, searchGroupLecturerByName);

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

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    deleteGroupLecturer,
);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    validateGroupLecturer,
    createGroupLecturer,
);

router.get(APP_ROUTER.INDEX, getGroupLecturers);

module.exports = router;
