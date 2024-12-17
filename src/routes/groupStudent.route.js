const express = require('express');

const { APP_ROUTER } = require('../constants/router');

const {
    getGroupStudents,
    getGroupStudentsByTypeAssign,
    getGroupStudentsByLecturerId,
    getGroupStudentsByTopicId,
    getGroupStudentById,
    getGroupStudentMembers,
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
    countGroupStudents,
    countGroupStudentsByLecturerId,
    searchGroupStudentByName,
    exportGroupStudents,
    exportGroupStudentsByLecturerId,
    submitLink,
} = require('../controllers/groupStudent.controller');
const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');
const { validateGroupStudent } = require('../middleware/validation.middleware');
const router = express.Router();

router.get(APP_ROUTER.ME, protectStudent, getMyGroupStudent);

router.get(APP_ROUTER.GROUP_STUDENT_BY_LECTURER, protectLecturer, getGroupStudentsByLecturerId);

router.get(APP_ROUTER.GROUP_STUDENT_BY_TOPIC, protectLecturer, getGroupStudentsByTopicId);

router.get(APP_ROUTER.GROUP_STUDENT_BY_ASSIGN, protectLecturer, getGroupStudentsByTypeAssign);

router.get(APP_ROUTER.GROUP_STUDENT_BY_TERM, protectStudent, getGroupStudentsByTermId);

router.get(APP_ROUTER.GROUP_STUDENT_MEMBER, protectLecturer, getGroupStudentMembers);

router.get(APP_ROUTER.COUNT, protectLecturer, countGroupStudents);

router.get(APP_ROUTER.COUNT_BY_LECTURER, protectLecturer, countGroupStudentsByLecturerId);

router.get(APP_ROUTER.SEARCH, protectLecturer, searchGroupStudentByName);

router.post(
    APP_ROUTER.IMPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    importGroupStudent,
);

router.get(
    APP_ROUTER.EXPORT,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    exportGroupStudents,
);

router.get(APP_ROUTER.EXPORT_ME, protectLecturer, exportGroupStudentsByLecturerId);

router.put(APP_ROUTER.GROUP_STUDENT_ASSIGN_ADMIN, protectStudent, assignAdminGroupStudent);

router.put(
    APP_ROUTER.GROUP_STUDENT_ADD_MEMBER,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    addMemberGroupStudent,
);

router.put(
    APP_ROUTER.GROUP_STUDENT_DELETE_MEMBER,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
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
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    assignTopic,
);

router.put(
    APP_ROUTER.GROUP_STUDENT_REMOVE_TOPIC,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    removeTopic,
);

router.delete(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    deleteGroupStudent,
);

router.put(APP_ROUTER.GROUP_STUDENT_SUBMIT, protectStudent, submitLink);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    validateGroupStudent,
    createGroupStudent,
);

router.get(APP_ROUTER.ID, protectLecturer, getGroupStudentById);

router.get(APP_ROUTER.INDEX, protectLecturer, getGroupStudents);

module.exports = router;
