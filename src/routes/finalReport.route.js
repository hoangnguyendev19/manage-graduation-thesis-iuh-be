const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getFinalReports,
    getFinalReportsByLecturerId,
    getFinalReportByGroupStudentId,
    createFinalReport,
    updateFinalReport,
    commentFinalReport,
} = require('../controllers/finalReport.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');

const upload = require('../configs/uploadFileConfig');

const router = express.Router();

router.post(APP_ROUTER.INDEX, protectStudent, upload.single('file'), createFinalReport);

router.put(APP_ROUTER.FINAL_REPORT_COMMENT, protectLecturer, commentFinalReport);

router.put(APP_ROUTER.ID, protectStudent, upload.single('file'), updateFinalReport);

router.get(
    APP_ROUTER.FINAL_REPORT_BY_GROUP_STUDENT,
    protectStudent,
    getFinalReportByGroupStudentId,
);

router.get(APP_ROUTER.FINAL_REPORT_BY_LECTURER, protectLecturer, getFinalReportsByLecturerId);

router.get(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    getFinalReports,
);

module.exports = router;
