const APP_ROUTER = {
    //CORE
    INDEX: '/',
    ID: '/:id',
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/refresh-token',
    UPDATE_PASSWORD: '/update-password',
    ME: '/me',
    IMPORT: '/import',
    PARAMS: '/params',
    RESET_PASSWORD: '/reset-password',
    // FORGOT_PASSWORD: '/forgot-password',

    // UPLOAD
    UPLOAD: '/api/v1/uploads',

    //MAJORS
    MAJORS: '/api/v1/majors',

    //LECTURERS:
    LECTURER: '/api/v1/lecturers',

    // LECTURER_AVAILABLE_GROUP: '/available-group',
    CHANGE_ROLE_LECTURE: '/:id/role',
    // IMPORT_LECTURE: '/import-lecturer',

    // LECTURER_TERM
    LECTURER_TERM: '/api/v1/lecturer-terms',

    //STUDENTS
    STUDENT: '/api/v1/students',
    // STUDENT_RESET_PASSWORD: '/:id/reset-password',
    // STUDENT_EXPORT: '/export-transcript',

    //TERMS
    TERM: '/api/v1/terms',
    TERM_NOW: '/now',
    TERM_CHOOSE_GROUP: '/:id/choose-group',
    TERM_CHOOSE_TOPIC: '/:id/choose-topic',
    TERM_DISCUSSION: '/:id/discussion',
    TERM_REPORT: '/:id/report',
    TERM_PUBLIC_RESULT: '/:id/public-result',

    //TRANSCRIPTS
    TRANSCRIPT: '/api/v1/transcripts',
    TRANSCRIPT_BY_SUMMARY: '/summary',

    //TOPICS
    TOPIC: '/api/v1/topics',
    TOPIC_STATUS: '/:id/status',

    //GROUP_LECTURER
    GROUP_LECTURER: '/api/v1/group-lecturers',
    GROUP_LECTURER_ADD_MEMBER: '/:id/add-member',
    GROUP_LECTURER_REMOVE_MEMBER: '/:id/remove-member',

    //GROUP_STUDENT
    GROUP_STUDENT: '/api/v1/group-students',
    GROUP_STUDENT_BY_MAJOR: '/major',
    GROUP_STUDENT_TYPE_REPORT: '/:id/type-report',
    GROUP_STUDENT_STATUS: '/:id/status',
    GROUP_STUDENT_ASSIGN_ADMIN: '/:id/assign-admin',
    GROUP_STUDENT_ASSIGN_TOPIC: '/:id/assign-topic',
    GROUP_STUDENT_REMOVE_MEMBER: '/:id/remove-member',
    GROUP_STUDENT_LEAVE_GROUP: '/:id/leave-group',
    GROUP_STUDENT_JOIN_GROUP: '/:id/join-group',
    GROUP_STUDENT_CHOOSE_TOPIC: '/:id/choose-topic',
    GROUP_STUDENT_CANCEL_TOPIC: '/:id/cancel-topic',

    //test route
    GROUP_NOTIFICATION: '/:id/notfication',

    //NOTIFICATION_STUDENT
    NOTIFICATION_STUDENT: '/api/v1/notification-students',
    NOTIFICATION_STUDENT_READ: '/:id/read',

    //NOTIFICATION_LECTURER
    NOTIFICATION_LECTURER: '/api/v1/notification-lecturers',
    NOTIFICATION_LECTURER_READ: '/:id/read',

    //EVALUATIONS
    EVALUATION: '/api/v1/evaluations',
    // EVALUATION_EXPORT_PDF: '/pdf/assigns/:assign_id/download',
    // GENERATE_EVALUATION: '/pdf/download',

    //ASSIGNS
    ASSIGN: '/assigns',
    ASSIGN_BY_ID: '/:id',
    ASSIGN_BY_LECTURER_ID: '/lecturers/:lecturer_id',

    //ACHIEVEMENT
    ACHIEVEMENT: '/api/v1/achievements',
};

module.exports = { APP_ROUTER };
