const { APP_ROUTER } = require('../constants/router');

const major = require('./major.route');
const lecturer = require('./lecturer.route');
const role = require('./role.route');
const student = require('./student.route');
const term = require('./term.route');
const lecturerTerm = require('./lecturerTerm.route');
const topic = require('./topic.route');
const groupLecturer = require('./groupLecturer.route');
const evaluation = require('./evaluation.route');
const groupStudent = require('./groupStudent.route');
const transcript = require('./transcript.route');
const notificationStudent = require('./notificationStudent.route');
const notificationLecturer = require('./notificationLecturer.route');
const notification = require('./notification.route');
const assign = require('./assign.route');
const suggest = require('./suggest.route');
const article = require('./article.route');
const finalReport = require('./finalReport.route');
const event = require('./event.route');
const comment = require('./comment.route');

function router(app) {
    app.use(APP_ROUTER.MAJOR, major);
    app.use(APP_ROUTER.LECTURER, lecturer);
    app.use(APP_ROUTER.ROLE, role);
    app.use(APP_ROUTER.STUDENT, student);
    app.use(APP_ROUTER.TERM, term);
    app.use(APP_ROUTER.LECTURER_TERM, lecturerTerm);
    app.use(APP_ROUTER.TOPIC, topic);
    app.use(APP_ROUTER.GROUP_LECTURER, groupLecturer);
    app.use(APP_ROUTER.EVALUATION, evaluation);
    app.use(APP_ROUTER.GROUP_STUDENT, groupStudent);
    app.use(APP_ROUTER.TRANSCRIPT, transcript);
    app.use(APP_ROUTER.NOTIFICATION_STUDENT, notificationStudent);
    app.use(APP_ROUTER.NOTIFICATION_LECTURER, notificationLecturer);
    app.use(APP_ROUTER.NOTIFICATION, notification);
    app.use(APP_ROUTER.ASSIGN, assign);
    app.use(APP_ROUTER.SUGGEST, suggest);
    app.use(APP_ROUTER.ARTICLE, article);
    app.use(APP_ROUTER.FINAL_REPORT, finalReport);
    app.use(APP_ROUTER.EVENT, event);
    app.use(APP_ROUTER.COMMENT, comment);
}

module.exports = router;
