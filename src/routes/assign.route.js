const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getAssigns,
    exportAssigns,
    getAssignByType,
    createAssign,
    updateAssign,
    deleteAssign,
    getAssignById,
    getAssignByLecturerId,
    getGroupStudentNoAssign,
} = require('../controllers/assign.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.get(APP_ROUTER.ASSIGN_BY_TYPE, getAssignByType);

router.get(APP_ROUTER.ASSIGN_BY_TYPE_AND_LECTURER_ID, getAssignByLecturerId);

router.get(APP_ROUTER.GROUP_STUDENT_NO_ASSIGN_BY_TYPE, getGroupStudentNoAssign);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    createAssign,
);

router.put(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    updateAssign,
);

router.delete(
    APP_ROUTER.ID + APP_ROUTER.ASSIGN_BY_TYPE,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    deleteAssign,
);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    exportAssigns,
);

router.get(APP_ROUTER.ID, getAssignById);

router.get(APP_ROUTER.INDEX, getAssigns);

module.exports = router;
