const APP_ROUTER = {
    //CORE
    INDEX: '/',
    QUERY: '/query',
    LIST: '/list',
    COUNT: '/count',
    COUNT_BY_LECTURER: '/count-by-lecturer',
    ID: '/:id',
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/refresh-token',
    UPDATE_PASSWORD: '/update-password',
    ME: '/me',
    IMPORT: '/import',
    IMPORT_FROM_SELECT: '/import-from-select',
    RESET_PASSWORD: '/reset-password',
    FORGOT_PASSWORD: '/forgot-password',
    LOCK: '/lock',
    UNLOCK: '/unlock',
    SEARCH: '/search',
    EXPORT: '/export',
    EXPORT_ME: '/export-me',

    // SUGGEST
    SUGGEST: '/api/v1/suggest',

    // ANALYSIS
    ANALYSIS: '/api/v1/analysis',
    ANALYSIS_TOPICS: '/topics',
    ANALYSIS_LECTURERS: '/lecturers',

    // UPLOAD
    UPLOAD: '/api/v1/uploads',

    //MAJORS
    MAJOR: '/api/v1/majors',

    //LECTURERS:
    LECTURER: '/api/v1/lecturers',
    LECTURER_BY_MAJOR: '/major/:id',

    //ROLES
    ROLE: '/api/v1/roles',
    ROLE_BY_LECTURER: '/lecturer/:id',

    // LECTURER_TERM
    LECTURER_TERM: '/api/v1/lecturer-terms',
    LECTURER_TERM_TO_ADDING: '/to-adding',

    //STUDENTS
    STUDENT: '/api/v1/students',
    STUDENT_STATUS: '/:id/status',
    STUDENTS_NO_HAVE_GROUP: '/no-have-group',

    //TERMS
    TERM: '/api/v1/terms',
    TERM_BY_MAJOR: '/major/:id',
    TERM_NOW: '/now',
    TERM_CHOOSE_GROUP: '/:id/choose-group',
    TERM_PUBLIC_TOPIC: '/:id/public-topic',
    TERM_CHOOSE_TOPIC: '/:id/choose-topic',
    TERM_DISCUSSION: '/:id/discussion',
    TERM_REPORT: '/:id/report',
    TERM_PUBLIC_RESULT: '/:id/public-result',
    TERM_BY_LECTURER: '/lecturer',

    //TRANSCRIPTS
    TRANSCRIPT: '/api/v1/transcripts',
    TRANSCRIPT_BY_SUMMARY: '/summary',
    TRANSCRIPT_BY_LECTURER_SUPPORT: '/lecturer-supports',
    TRANSCRIPT_GROUP_STUDENT_TO_SCORING: '/lecturer-supports/group-student-to-scoring',
    TRANSCRIPT_BY_STUDENT: '/student',
    TRANSCRIPT_BY_GROUP_STUDENT: '/group-student',
    TRANSCRIPT_STATISTIC: '/statistic',

    //TOPICS
    TOPIC: '/api/v1/topics',
    TOPIC_TERM: 'api/v1/topics/:termId',
    TOPIC_STATUS: '/:id/status',
    TOPIC_QUANTITY_GROUP_MAX: '/quantity-group-max',
    TOPIC_BY_GROUP_LECTURER: '/group-lecturer/:id',
    TOPIC_BY_LECTURER: '/lecturer/:lecturerId',
    TOPIC_APPROVED: '/approved',

    //GROUP_LECTURERS
    GROUP_LECTURER: '/api/v1/group-lecturers',
    GROUP_LECTURER_MEMBER: '/:id/members',
    GROUP_LECTURER_NO_GROUP: '/:type/no-group',
    GROUP_LECTURER_BY_LECTURER: '/lecturer',
    GROUP_LECTURER_EVALUATION: '/evaluation',
    GROUP_LECTURER_EVALUATION_LECTURER: '/evaluation-lecturer',

    //GROUP_STUDENTS
    GROUP_STUDENT: '/api/v1/group-students',
    GROUP_STUDENT_BY_LECTURER: '/lecturer',
    GROUP_STUDENT_BY_TOPIC: '/topic',
    GROUP_STUDENT_BY_TERM: '/term',
    GROUP_STUDENT_BY_ASSIGN: '/assign',
    GROUP_STUDENT_ASSIGN_ADMIN: '/:id/assign-admin',
    GROUP_STUDENT_ASSIGN_TOPIC: '/:id/assign-topic',
    GROUP_STUDENT_REMOVE_TOPIC: '/:id/remove-topic',
    GROUP_STUDENT_ADD_MEMBER: '/:id/add-member',
    GROUP_STUDENT_DELETE_MEMBER: '/:id/delete-member',
    GROUP_STUDENT_REMOVE_MEMBER: '/:id/remove-member',
    GROUP_STUDENT_LEAVE_GROUP: '/:id/leave-group',
    GROUP_STUDENT_JOIN_GROUP: '/:id/join-group',
    GROUP_STUDENT_CHOOSE_TOPIC: '/:id/choose-topic',
    GROUP_STUDENT_CANCEL_TOPIC: '/:id/cancel-topic',
    GROUP_STUDENT_MEMBER: '/:id/members',

    //NOTIFICATIONS
    NOTIFICATION: '/api/v1/notifications',

    //NOTIFICATION_STUDENTS
    NOTIFICATION_STUDENT: '/api/v1/notification-students',
    NOTIFICATION_GROUP_STUDENT: '/group-student',
    NOTIFICATION_GROUP_STUDENT_MY_INSTRUCTOR: '/group-student/my-instructor',
    NOTIFICATION_STUDENT_TERM: '/terms',
    NOTIFICATION_STUDENT_READ: '/:id/read',

    //NOTIFICATION_LECTURERS
    NOTIFICATION_LECTURER: '/api/v1/notification-lecturers',
    NOTIFICATION_GROUP_LECTURER: '/group-lecturer',
    NOTIFICATION_LECTURER_TERM: '/terms',
    NOTIFICATION_LECTURER_READ: '/:id/read',

    //EVALUATIONS
    EVALUATION: '/api/v1/evaluations',
    SCORES: '/scores',

    //ASSIGNS
    ASSIGN: '/api/v1/assigns',
    GROUP_STUDENT_NO_ASSIGN_BY_TYPE: '/type-evaluation/:type/group-student/no-assign',

    //ACHIEVEMENT
    ACHIEVEMENT: '/api/v1/achievements',
};

module.exports = { APP_ROUTER };
