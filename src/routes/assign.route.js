const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getAssigns,
    getAssignByType,
    createAssignByType,
    getAssignById,
    getAssignByLecturerId,
    getGroupStudentNoAssign,
} = require('../controllers/assign.controller');
const {
    isExistLecturerSupportInGroupLecturer,
    isExitGroupLecturerAndGroupStudent,
} = require('../middleware/assign.middleware');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getAssigns);
router.get(APP_ROUTER.ASSIGN_BY_ID, getAssignById);

router.get(APP_ROUTER.ASSIGN_BY_TYPE, getAssignByType);
router.get(APP_ROUTER.ASSIGN_BY_TYPE_AND_LECTURER_ID, getAssignByLecturerId);
router.get(APP_ROUTER.GROUP_STUDENT_NO_ASSIGN_BY_TYPE, getGroupStudentNoAssign);

router.post(
    APP_ROUTER.ASSIGN_BY_TYPE,
    isExistLecturerSupportInGroupLecturer,
    isExitGroupLecturerAndGroupStudent,
    createAssignByType,
);

module.exports = router;
