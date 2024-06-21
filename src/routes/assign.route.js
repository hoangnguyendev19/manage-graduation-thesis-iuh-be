const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getAssigns,
    getAssignByType,
    createAssignByType,
} = require('../controllers/assign.controller');
const {
    isExistLecturerSupportInGroupLecturer,
    isExitGroupLecturerAndGroupStudent,
} = require('../middleware/assign.middleware');

const router = express.Router();

router.get(APP_ROUTER.ASSIGN_BY_TYPE, getAssignByType);
router.get(APP_ROUTER.INDEX, getAssigns);
router.post(
    APP_ROUTER.ASSIGN_BY_TYPE,
    isExistLecturerSupportInGroupLecturer,
    isExitGroupLecturerAndGroupStudent,
    createAssignByType,
);

module.exports = router;
