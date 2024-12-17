const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    exportAssigns,
    exportAssignsByLecturerId,
    createAssign,
    updateAssign,
    deleteAssign,
    getGroupStudentNoAssign,
} = require('../controllers/assign.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    createAssign,
);

router.put(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    updateAssign,
);

router.delete(
    APP_ROUTER.ID + APP_ROUTER.ASSIGN_BY_TYPE,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    deleteAssign,
);

router.get(
    APP_ROUTER.GROUP_STUDENT_NO_ASSIGN_BY_TYPE,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    getGroupStudentNoAssign,
);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    exportAssigns,
);

router.get(APP_ROUTER.EXPORT_ME, protectLecturer, exportAssignsByLecturerId);

module.exports = router;
