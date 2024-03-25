const { APP_ROUTER } = require('../constants/router');

const major = require('./major.route');
const lecturer = require('./lecturer.route');
const student = require('./student.route');
const term = require('./term.route');
const lecturerTerm = require('./lecturerTerm.route');
const topic = require('./topic.route');
const groupLecturer = require('./groupLecturer.route');
const evaluation = require('./evaluation.route');
const groupStudent = require('./groupStudent.route');
const transcript = require('./transcript.route');
const achievement = require('./achievement.route');
const notificationStudent = require('./notificationStudent.route');
const notificationLecturer = require('./notificationLecturer.route');
const upload = require('./upload.route');

function router(app) {
    app.use(APP_ROUTER.MAJORS, major);
    app.use(APP_ROUTER.LECTURER, lecturer);
    app.use(APP_ROUTER.STUDENT, student);
    app.use(APP_ROUTER.TERM, term);
    app.use(APP_ROUTER.LECTURER_TERM, lecturerTerm);
    app.use(APP_ROUTER.TOPIC, topic);
    app.use(APP_ROUTER.GROUP_LECTURER, groupLecturer);
    app.use(APP_ROUTER.EVALUATION, evaluation);
    app.use(APP_ROUTER.GROUP_STUDENT, groupStudent);
    app.use(APP_ROUTER.TRANSCRIPT, transcript);
    app.use(APP_ROUTER.ACHIEVEMENT, achievement);
    app.use(APP_ROUTER.NOTIFICATION_STUDENT, notificationStudent);
    app.use(APP_ROUTER.NOTIFICATION_LECTURER, notificationLecturer);
    app.use(APP_ROUTER.UPLOAD, upload);
}

module.exports = router;
