const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupStudents,
    getGroupStudentsByLecturerId,
    getGroupStudentsByTopicId,
    getGroupStudentById,
    getGroupStudentMembers,
    getGroupStudentOfSearch,
    getMembersById,
    getGroupStudentsByTermId,
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
    removeTopic,
    deleteGroupStudent,
    chooseTopic,
    cancelTopic,
    countOfGroupStudent,
    searchGroupStudentByName,
    exportGroupStudent,
} = require('../controllers/groupStudent.controller');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');
const { validateGroupStudent } = require('../middleware/validation.middleware');
const router = express.Router();

router.get(APP_ROUTER.ME, protectStudent, getMyGroupStudent);

router.get(APP_ROUTER.GROUP_STUDENT_BY_LECTURER, getGroupStudentsByLecturerId);

router.get(APP_ROUTER.GROUP_STUDENT_BY_TOPIC, getGroupStudentsByTopicId);

router.get(APP_ROUTER.GROUP_STUDENT_BY_TERM, protectStudent, getGroupStudentsByTermId);

router.get(APP_ROUTER.GROUP_STUDENT_MEMBER, getGroupStudentMembers);

router.get(APP_ROUTER.QUERY, getGroupStudentOfSearch);

router.get(APP_ROUTER.COUNT, countOfGroupStudent);

router.get(APP_ROUTER.SEARCH, searchGroupStudentByName);

router.get(APP_ROUTER.MEMBER, getMembersById);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    importGroupStudent,
);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    exportGroupStudent,
);

router.put(APP_ROUTER.GROUP_STUDENT_ASSIGN_ADMIN, protectStudent, assignAdminGroupStudent);

router.put(
    APP_ROUTER.GROUP_STUDENT_ADD_MEMBER,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    addMemberGroupStudent,
);

router.put(
    APP_ROUTER.GROUP_STUDENT_DELETE_MEMBER,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
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
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    assignTopic,
);

router.put(
    APP_ROUTER.GROUP_STUDENT_REMOVE_TOPIC,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    removeTopic,
);

router.get(APP_ROUTER.ID, getGroupStudentById);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    deleteGroupStudent,
);

router.get(APP_ROUTER.INDEX, getGroupStudents);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    validateGroupStudent,
    createGroupStudent,
);

module.exports = router;
