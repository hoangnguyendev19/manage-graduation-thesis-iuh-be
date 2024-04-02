const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupStudents,
    getGroupStudentById,
    getGroupStudentsByMajor,
    getMyGroupStudent,
    createGroupStudent,
    updateTypeReport,
    updateStatus,
    assignAdminGroupStudent,
    deleteMemberGroupStudent,
    removeGroupStudent,
    joinGroupStudent,
    assignTopic,
    deleteGroupStudent,
} = require('../controllers/groupStudent.controller');
const { protectLecturer, checkRoleLecturer } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');
const router = express.Router();

router.get(APP_ROUTER.ME, protectStudent, getMyGroupStudent);

router.get(APP_ROUTER.GROUP_STUDENT_BY_MAJOR, protectStudent, getGroupStudentsByMajor);

router.get(APP_ROUTER.INDEX, getGroupStudents);

router.get(APP_ROUTER.ID, getGroupStudentById);

router.post(APP_ROUTER.INDEX, protectStudent, createGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_TYPE_REPORT, protectLecturer, updateTypeReport);

router.put(APP_ROUTER.GROUP_STUDENT_STATUS, protectLecturer, updateStatus);

router.put(APP_ROUTER.GROUP_STUDENT_ASSIGN_ADMIN, protectStudent, assignAdminGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_DELETE_MEMBER, protectStudent, deleteMemberGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_REMOVE_GROUP, protectStudent, removeGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_JOIN_GROUP, protectStudent, joinGroupStudent);

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

module.exports = router;
