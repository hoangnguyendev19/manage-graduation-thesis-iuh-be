const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupStudents,
    getGroupStudentsByLecturer,
    getGroupStudentById,
    getMembersById,
    getGroupStudentsByMajor,
    getMyGroupStudent,
    createGroupStudent,
    importGroupStudent,
    assignAdminGroupStudent,
    addMemberGroupStudent,
    deleteMemberGroupStudent,
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

router.get(APP_ROUTER.GROUP_STUDENT_BY_LECTURER, protectLecturer, getGroupStudentsByLecturer);

router.get(APP_ROUTER.INDEX, getGroupStudents);

router.get(APP_ROUTER.MEMBER, getMembersById);

router.get(APP_ROUTER.ID, getGroupStudentById);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    createGroupStudent,
);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    importGroupStudent,
);

router.put(APP_ROUTER.GROUP_STUDENT_ASSIGN_ADMIN, protectStudent, assignAdminGroupStudent);

router.put(
    APP_ROUTER.GROUP_STUDENT_ADD_MEMBER,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    addMemberGroupStudent,
);

router.put(
    APP_ROUTER.GROUP_STUDENT_DELETE_MEMBER,
    protectLecturer,
    checkRoleLecturer('HEAD_LECTURER'),
    deleteMemberGroupStudent,
);

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
