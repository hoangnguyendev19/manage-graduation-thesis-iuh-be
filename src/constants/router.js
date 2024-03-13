const APP_ROUTER = {
    //CORE
    INDEX: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    UPDATE_PASSWORD: '/update-password',
    // FORGOT_PASSWORD: '/forgot-password',
    // GENERATE_ACCESSTOKEN: '/accessToken-generate',

    //MAJORS
    MAJORS: '/api/v1/majors',
    MAJORS_BY_ID: '/:id',

    //LECTURERS:
    LECTURER: '/api/v1/lecturers',
    LECTURER_BY_ID: '/:id',
    // LECTURER_AVAILABLE_GROUP: '/available-group',
    CHANGE_ROLE_LECTURE: '/:id/role',
    // IMPORT_LECTURE: '/import-lecturer',

    //STUDENTS
    STUDENT: '/students',
    STUDENT_BY_ID: '/:id',

    STUDENT_RESET_PASSWORD: '/:id/reset-password',
    STUDENT_IMPORT: '/import-student',
    STUDENT_EXPORT: '/export-transcript',

    //TERMS
    TERM: '/terms',
    TERM_BY_ID: '/:id',
    TERM_PUBLIC_RESULT: '/:id/public-result',
    TERM_NOW: '/now',

    //TRANSCRIPTS
    TRANSCRIPT: '/transcripts',
    TRANSCRIPT_BY_ID: '/:id',
    TRANSCRIPT_BY_GROUP_STUDENT: '/group-student/:group_student_id',
    TRANSCRIPT_BY_SUMMARY: '/summary',

    //TOPICS
    TOPIC: '/topics',
    TOPIC_BY_ID: '/:id',
    TOPIC_REVIEW: '/:id/review',

    //GROUP_LECTURER
    GROUP_LECTURER: '/group_lecturers',
    GROUP_LECTURER_BY_ID: '/:id',
    GROUP_LECTURER_MEMBERS: '/:id/members/:lecturer_id',

    //GROUP_STUDENT
    GROUP_STUDENT: '/group_students',
    GROUP_STUDENT_BY_ID: '/:id',
    GROUP_TYPE_REPORT: '/:id/type_report',
    GROUP_GRANT_TOPIC: '/grant-topic',
    GROUP_TOPIC: '/topic',
    GROUP_BY_STUDENT_ID: '/:student_id',
    LIST_GROUP_BY_GROUP_LECTURER: '/group-lecturer/:group_lecturer_id',

    //test route
    GROUP_NOTIFICATION: '/:id/notfication',

    //NOTIFICATION_STUDENT
    NOTIFICATION_STUDENT: '/notification-students',
    NOTIFICATION_STUDENT_BY_ID: '/:id',

    //EVALUATIONS
    EVALUATION: '/evaluations',
    EVALUATION_BY_ID: '/:id',
    EVALUATION_EXPORT_PDF: '/pdf/assigns/:assign_id/download',
    GENERATE_EVALUATION: '/pdf/download',

    //ASSIGNS
    ASSIGN: '/assigns',
    ASSIGN_BY_ID: '/:id',
    ASSIGN_BY_LECTURER_ID: '/lecturers/:lecturer_id',

    //ACHIEVEMENT
    ACHIEVEMENT: '/achievements',
    ACHIEVEMENT_BY_ID: '/:id',
};

module.exports = { APP_ROUTER };
