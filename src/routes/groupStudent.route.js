const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupStudents,
    getGroupStudentById,
    getMyGroupStudent,
    createGroupStudent,
    updateTypeReport,
    updateStatus,
    assignTopic,
    deleteGroupStudent,
    addStudentToGroupStudent,
    removeStudentFromGroupStudent,
} = require('../controller/groupStudent/groupStudent.controller');
const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');
const router = express.Router();

router.get(APP_ROUTER.ME, protectStudent, getMyGroupStudent);

router.get(APP_ROUTER.INDEX, getGroupStudents);

router.get(APP_ROUTER.ID, getGroupStudentById);

router.post(APP_ROUTER.INDEX, protectStudent, createGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_TYPE_REPORT, protectLecturer, updateTypeReport);

router.put(APP_ROUTER.GROUP_STUDENT_STATUS, protectLecturer, updateStatus);

router.put(
    APP_ROUTER.GROUP_STUDENT_ASSIGN_TOPIC,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    assignTopic,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    deleteGroupStudent,
);

router.put(APP_ROUTER.GROUP_STUDENT_ADD_MEMBER, addStudentToGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_REMOVE_MEMBER, removeStudentFromGroupStudent);

module.exports = router;
