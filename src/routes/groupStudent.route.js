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
    removeMemberGroupStudent,
    leaveGroupStudent,
    joinGroupStudent,
    assignTopic,
    deleteGroupStudent,
    chooseTopic,
    cancelTopic,
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

router.put(APP_ROUTER.GROUP_STUDENT_ASSIGN_ADMIN, protectStudent, assignAdminGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_REMOVE_MEMBER, protectStudent, removeMemberGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_LEAVE_GROUP, protectStudent, leaveGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_JOIN_GROUP, protectStudent, joinGroupStudent);

router.put(APP_ROUTER.GROUP_STUDENT_CHOOSE_TOPIC, protectStudent, chooseTopic);

router.put(APP_ROUTER.GROUP_STUDENT_CANCEL_TOPIC, protectStudent, cancelTopic);

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
