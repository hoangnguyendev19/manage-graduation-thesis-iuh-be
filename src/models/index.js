const { sequelize } = require('../configs/connectDB');
const { DataTypes } = require('sequelize');

const StudentModel = require('./student.model');
const MajorModel = require('./major.model');
const LecturerModel = require('./lecturer.model');
const RoleModel = require('./role.model');
const GroupLecturerModel = require('./groupLecturer.model');
const GroupLecturerMemberModel = require('./groupLecturerMember.model');
const LecturerTermModel = require('./lecturerTerm.model');
const TermModel = require('./term.model');
const TermDetailModel = require('./termDetail.model');
const TopicModel = require('./topic.model');
const TranscriptModel = require('./transcript.model');
const EvaluationModel = require('./evaluation.model');
const GroupStudentModel = require('./groupStudent.model');
const AssignModel = require('./assign.model');
const StudentTermModel = require('./studentTerm.model');
const NotificationStudentModel = require('./notificationStudent.model');
const NotificationLecturerModel = require('./notificationLecturer.model');
const NotificationModel = require('./notification.model');
const ArticleModel = require('./article.model');
const EventModel = require('./event.model');
const EventGroupStudentModel = require('./eventGroupStudent.model');

// Models
const Major = MajorModel(sequelize, DataTypes);
const Student = StudentModel(sequelize, DataTypes);
const Lecturer = LecturerModel(sequelize, DataTypes);
const Role = RoleModel(sequelize, DataTypes);
const GroupLecturer = GroupLecturerModel(sequelize, DataTypes);
const GroupLecturerMember = GroupLecturerMemberModel(sequelize, DataTypes);
const LecturerTerm = LecturerTermModel(sequelize, DataTypes);
const Term = TermModel(sequelize, DataTypes);
const TermDetail = TermDetailModel(sequelize, DataTypes);
const Topic = TopicModel(sequelize, DataTypes);
const Transcript = TranscriptModel(sequelize, DataTypes);
const Evaluation = EvaluationModel(sequelize, DataTypes);
const GroupStudent = GroupStudentModel(sequelize, DataTypes);
const Assign = AssignModel(sequelize, DataTypes);
const StudentTerm = StudentTermModel(sequelize, DataTypes);
const NotificationStudent = NotificationStudentModel(sequelize, DataTypes);
const NotificationLecturer = NotificationLecturerModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const Article = ArticleModel(sequelize, DataTypes);
const Event = EventModel(sequelize, DataTypes);
const EventGroupStudent = EventGroupStudentModel(sequelize, DataTypes);

// Associations
Major.hasMany(Student, {
    foreignKey: 'major_id',
    as: 'students',
});

Student.belongsTo(Major, {
    foreignKey: 'major_id',
    as: 'major',
});

Major.hasMany(Lecturer, {
    foreignKey: 'major_id',
    as: 'lecturers',
});

Lecturer.belongsTo(Major, {
    foreignKey: 'major_id',
    as: 'major',
});

Lecturer.hasMany(Role, {
    foreignKey: 'lecturer_id',
    as: 'roles',
});

Role.belongsTo(Lecturer, {
    foreignKey: 'lecturer_id',
    as: 'lecturer',
});

Lecturer.hasMany(LecturerTerm, {
    foreignKey: 'lecturer_id',
    as: 'lecturerTerms',
});

LecturerTerm.belongsTo(Lecturer, {
    foreignKey: 'lecturer_id',
    as: 'lecturer',
});

LecturerTerm.hasMany(Topic, {
    foreignKey: 'lecturer_term_id',
    as: 'topics',
});

Topic.belongsTo(LecturerTerm, {
    foreignKey: 'lecturer_term_id',
    as: 'lecturerTerm',
});

LecturerTerm.hasMany(GroupLecturerMember, {
    foreignKey: 'lecturer_term_id',
    as: 'groupLecturerMembers',
});

GroupLecturerMember.belongsTo(LecturerTerm, {
    foreignKey: 'lecturer_term_id',
    as: 'lecturerTerm',
});

Term.hasMany(LecturerTerm, {
    foreignKey: 'term_id',
    as: 'lecturerTerms',
});

LecturerTerm.belongsTo(Term, {
    foreignKey: 'term_id',
    as: 'term',
});

Term.hasMany(TermDetail, {
    foreignKey: 'term_id',
    as: 'termDetails',
});

TermDetail.belongsTo(Term, {
    foreignKey: 'term_id',
    as: 'term',
});

Major.hasMany(Term, {
    foreignKey: 'major_id',
    as: 'terms',
});

Term.belongsTo(Major, {
    foreignKey: 'major_id',
    as: 'major',
});

GroupLecturer.hasMany(GroupLecturerMember, {
    foreignKey: 'group_lecturer_id',
    as: 'groupLecturerMembers',
});

GroupLecturerMember.belongsTo(GroupLecturer, {
    foreignKey: 'group_lecturer_id',
    as: 'groupLecturer',
});

GroupLecturer.hasMany(Assign, {
    foreignKey: 'group_lecturer_id',
    as: 'assigns',
});

Assign.belongsTo(GroupLecturer, {
    foreignKey: 'group_lecturer_id',
    as: 'groupLecturer',
});

GroupStudent.hasMany(Assign, {
    foreignKey: 'group_student_id',
    as: 'assigns',
});

Assign.belongsTo(GroupStudent, {
    foreignKey: 'group_student_id',
    as: 'groupStudent',
});

Term.hasMany(GroupLecturer, {
    foreignKey: 'term_id',
    as: 'groupLecturers',
});

GroupLecturer.belongsTo(Term, {
    foreignKey: 'term_id',
    as: 'term',
});

Topic.hasMany(GroupStudent, {
    foreignKey: 'topic_id',
    as: 'groupStudents',
});

GroupStudent.belongsTo(Topic, {
    foreignKey: 'topic_id',
    as: 'topic',
});

Term.hasMany(GroupStudent, {
    foreignKey: 'term_id',
    as: 'groupStudents',
});

GroupStudent.belongsTo(Term, {
    foreignKey: 'term_id',
    as: 'term',
});

Term.hasMany(StudentTerm, {
    foreignKey: 'term_id',
    as: 'studentTerms',
});

StudentTerm.belongsTo(Term, {
    foreignKey: 'term_id',
    as: 'term',
});

GroupStudent.hasMany(StudentTerm, {
    foreignKey: 'group_student_id',
    as: 'studentTerms',
});

StudentTerm.belongsTo(GroupStudent, {
    foreignKey: 'group_student_id',
    as: 'groupStudent',
});

StudentTerm.hasMany(Transcript, {
    foreignKey: 'student_term_id',
    as: 'transcripts',
});

Transcript.belongsTo(StudentTerm, {
    foreignKey: 'student_term_id',
    as: 'studentTerm',
});

Evaluation.hasMany(Transcript, {
    foreignKey: 'evaluation_id',
    as: 'transcripts',
});

Transcript.belongsTo(Evaluation, {
    foreignKey: 'evaluation_id',
    as: 'evaluation',
});

Term.hasMany(Evaluation, {
    foreignKey: 'term_id',
    as: 'evaluations',
});

Evaluation.belongsTo(Term, {
    foreignKey: 'term_id',
    as: 'term',
});

Student.hasMany(StudentTerm, {
    foreignKey: 'student_id',
    as: 'studentTerms',
});

StudentTerm.belongsTo(Student, {
    foreignKey: 'student_id',
    as: 'student',
});

Student.hasMany(NotificationStudent, {
    foreignKey: 'student_id',
    as: 'notificationStudents',
});

NotificationStudent.belongsTo(Student, {
    foreignKey: 'student_id',
    as: 'student',
});

Notification.hasMany(NotificationStudent, {
    foreignKey: 'notification_id',
    as: 'notificationStudents',
});

NotificationStudent.belongsTo(Notification, {
    foreignKey: 'notification_id',
    as: 'notification',
});

Lecturer.hasMany(NotificationLecturer, {
    foreignKey: 'lecturer_id',
    as: 'notificationLecturers',
});

NotificationLecturer.belongsTo(Lecturer, {
    foreignKey: 'lecturer_id',
    as: 'lecturer',
});

Notification.hasMany(NotificationLecturer, {
    foreignKey: 'notification_id',
    as: 'notificationLecturers',
});

NotificationLecturer.belongsTo(Notification, {
    foreignKey: 'notification_id',
    as: 'notification',
});

Lecturer.hasMany(Notification, {
    foreignKey: 'created_by',
    as: 'notifications',
});

Notification.belongsTo(Lecturer, {
    foreignKey: 'created_by',
    as: 'lecturer',
});

LecturerTerm.hasMany(Transcript, {
    foreignKey: 'lecturer_term_id',
    as: 'transcripts',
});

Transcript.belongsTo(LecturerTerm, {
    foreignKey: 'lecturer_term_id',
    as: 'lecturerTerm',
});

GroupStudent.hasOne(Article, {
    foreignKey: 'group_student_id',
    as: 'article',
});

Article.belongsTo(GroupStudent, {
    foreignKey: 'group_student_id',
    as: 'groupStudent',
});

LecturerTerm.hasMany(Event, {
    foreignKey: 'lecturer_term_id',
    as: 'events',
});

Event.belongsTo(LecturerTerm, {
    foreignKey: 'lecturer_term_id',
    as: 'lecturerTerm',
});

Event.hasMany(EventGroupStudent, {
    foreignKey: 'event_id',
    as: 'eventGroupStudents',
});

EventGroupStudent.belongsTo(Event, {
    foreignKey: 'event_id',
    as: 'event',
});

GroupStudent.hasMany(EventGroupStudent, {
    foreignKey: 'group_student_id',
    as: 'eventGroupStudents',
});

EventGroupStudent.belongsTo(GroupStudent, {
    foreignKey: 'group_student_id',
    as: 'groupStudent',
});

// (async () => await sequelize.sync({ alter: true }))();
(async () => await sequelize.sync({}))();

module.exports = {
    Student,
    StudentTerm,
    GroupStudent,
    Major,
    Lecturer,
    Role,
    LecturerTerm,
    GroupLecturer,
    GroupLecturerMember,
    Term,
    TermDetail,
    Topic,
    Assign,
    Evaluation,
    NotificationStudent,
    NotificationLecturer,
    Notification,
    Transcript,
    Article,
    Event,
    EventGroupStudent,
};
