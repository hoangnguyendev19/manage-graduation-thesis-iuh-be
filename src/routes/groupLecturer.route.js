const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupLecturers,
    getGroupLecturersByLecturerId,
    getGroupLecturersByTypeEvaluation,
    getGroupLecturersByTypeEvaluationAndLecturerId,
    getGroupLecturerById,
    deleteGroupLecturer,
    removeLecturerFromGroupLecturer,
    getLecturerNoGroupByType,
    createGroupLecturer,
    addMemberToGroupLecturer,
    getMemberFromGroupLecturer,
    countGroupLecturersByTermId,
    countGroupLecturersByLecturerId,
    searchGroupLecturerByName,
    updateDateAndLocation,
    updatePosition,
} = require('../controllers/groupLecturer.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { validateGroupLecturer } = require('../middleware/validation.middleware');

const router = express.Router();

router.get(APP_ROUTER.GROUP_LECTURER_NO_GROUP, protectLecturer, getLecturerNoGroupByType);

router.get(APP_ROUTER.GROUP_LECTURER_BY_LECTURER, protectLecturer, getGroupLecturersByLecturerId);

router.get(
    APP_ROUTER.GROUP_LECTURER_EVALUATION,
    protectLecturer,
    getGroupLecturersByTypeEvaluation,
);

router.get(
    APP_ROUTER.GROUP_LECTURER_EVALUATION_LECTURER,
    protectLecturer,
    getGroupLecturersByTypeEvaluationAndLecturerId,
);

router.get(APP_ROUTER.GROUP_LECTURER_MEMBER, protectLecturer, getMemberFromGroupLecturer);

router.get(APP_ROUTER.COUNT, protectLecturer, countGroupLecturersByTermId);

router.get(APP_ROUTER.COUNT_BY_LECTURER, protectLecturer, countGroupLecturersByLecturerId);

router.get(APP_ROUTER.SEARCH, protectLecturer, searchGroupLecturerByName);

router.post(
    APP_ROUTER.GROUP_LECTURER_MEMBER,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    addMemberToGroupLecturer,
);

router.put(
    APP_ROUTER.GROUP_LECTURER_MEMBER,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    removeLecturerFromGroupLecturer,
);

router.put(
    APP_ROUTER.GROUP_LECTURER_POSITION,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updatePosition,
);

router.put(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateDateAndLocation,
);

router.get(APP_ROUTER.ID, protectLecturer, getGroupLecturerById);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    deleteGroupLecturer,
);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateGroupLecturer,
    createGroupLecturer,
);

router.get(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    getGroupLecturers,
);

module.exports = router;
