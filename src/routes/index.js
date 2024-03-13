const { APP_ROUTER } = require('../constants/router');

const major = require('./major.route');
const lecturer = require('./lecturer.route');
const student = require('./student.route');
const term = require('./term.route');
// const groupStudent = require('./groupStudent.route')
// const notificationStudent = require('./notificationStudent.route')
// const achievement = require('./achievement.route')
// const transcript = require('./transcript.route')

function router(app) {
    app.use(APP_ROUTER.MAJORS, major);
    app.use(APP_ROUTER.LECTURER, lecturer);
    app.use(APP_ROUTER.STUDENT, student);
    app.use(APP_ROUTER.TERM, term);
    // app.use(APP_ROUTER.GROUP_STUDENT, groupStudent)
    // app.use(APP_ROUTER.NOTIFICATION_STUDENT, notificationStudent)
    // app.use(APP_ROUTER.ACHIEVEMENT, achievement)
    // app.use(APP_ROUTER.TRANSCRIPT, transcript)
}

module.exports = router;
