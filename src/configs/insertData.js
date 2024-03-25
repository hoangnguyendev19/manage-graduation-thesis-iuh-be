const { forEach } = require('lodash');
const { fakerVI } = require('@faker-js/faker');
// const { sequelize } = require('./connectDB');
const { hashPassword } = require('../helper/bcrypt');

const {
    Achievement,
    Assign,
    Evaluation,
    GroupLecturer,
    GroupLecturerMember,
    GroupStudent,
    Lecturer,
    LecturerTerm,
    Major,
    NotificationLecturer,
    NotificationStudent,
    Student,
    StudentTerm,
    Term,
    Topic,
    Transcript,
} = require('../models/index');

const majorList = [
    {
        name: 'Hệ thống thông tin',
    },
    {
        name: 'Công nghệ thông tin',
    },
    {
        name: 'Kỹ thuật phần mềm',
    },
    {
        name: 'Khoa học máy tính',
    },
    {
        name: 'Khoa học dữ liệu',
    },
];

const termList = [
    {
        name: 'HK1_2024-2025',
    },
    {
        name: 'HK2_2024-2025',
    },
];

const faker = fakerVI;

const importData = async () => {
    const password = await hashPassword('12345678');
    try {
        // Major
        forEach(majorList, async (major) => {
            await Major.create({
                name: major.name,
            });
        });

        // Student
        forEach(new Array(20), async () => {
            await Student.create({
                userName: faker.number.int({ min: 20000000, max: 22000000 }),
                password,
                fullName: faker.person.fullName(),
                avatarUrl: faker.image.avatar(),
                phoneNumber: faker.phone.number(),
                email: faker.internet.email(),
                gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
                schoolYear: faker.helpers.arrayElement(['2021-2025', '2022-2026', '2023-2027']),
                typeTraining: faker.helpers.arrayElement(['COLLEGE', 'UNIVERSITY']),
                major_id: faker.number.int({ min: 1, max: 5 }),
            });
        });

        // Lecturer
        forEach(new Array(20), async () => {
            await Lecturer.create({
                userName: faker.number.int({ min: 20000000, max: 22000000 }),
                password,
                fullName: faker.person.fullName(),
                avatarUrl: faker.image.avatar(),
                phoneNumber: faker.phone.number(),
                email: faker.internet.email(),
                gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
                degree: faker.helpers.arrayElement(['BACHELOR', 'MASTER', 'DOCTOR']),
                role: faker.helpers.arrayElement([
                    'HEAD_LECTURER',
                    'LECTURER',
                    'SUB_HEAD_LECTURER',
                ]),
                major_id: faker.number.int({ min: 1, max: 5 }),
            });
        });

        // Term
        forEach(termList, async (term) => {
            await Term.create({
                name: term.name,
                startDate: faker.date.past(),
                endDate: faker.date.future(),
            });
        });

        // LecturerTerm
        forEach(new Array(20), async () => {
            await LecturerTerm.create({
                role: faker.helpers.arrayElement([
                    'HEAD_LECTURER',
                    'LECTURER',
                    'SUB_HEAD_LECTURER',
                ]),
                lecturer_id: faker.number.int({ min: 1, max: 20 }),
                term_id: faker.number.int({ min: 1, max: 2 }),
            });
        });

        // Topic
        forEach(new Array(50), async () => {
            await Topic.create({
                name: faker.person.jobTitle(),
                description: faker.lorem.paragraph(),
                quantityGroupMax: faker.number.int({ min: 1, max: 3 }),
                note: faker.lorem.paragraph(),
                target: faker.lorem.paragraph(),
                standardOutput: faker.lorem.paragraph(),
                requireInput: faker.lorem.paragraph(),
                comment: faker.lorem.paragraph(),
                status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED']),
                level: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
                lecturer_term_id: faker.number.int({ min: 1, max: 20 }),
            });
        });

        // GroupLecturer
        forEach(new Array(20), async (term) => {
            await GroupLecturer.create({
                name: faker.person.jobTitle(),
                type: faker.helpers.arrayElement(['ADVISOR', 'REVIEWER', 'SESSION_HOST']),
                term_id: faker.number.int({ min: 1, max: 2 }),
            });
        });

        // GroupLecturerMember
        forEach(new Array(40), async () => {
            await GroupLecturerMember.create({
                group_lecturer_id: faker.number.int({ min: 1, max: 20 }),
                lecturer_term_id: faker.number.int({ min: 1, max: 20 }),
            });
        });

        // Evaluation
        forEach(new Array(10), async (term) => {
            await Evaluation.create({
                name: faker.person.jobTitle(),
                scoreMax: faker.number.int({ min: 1, max: 10 }),
                description: faker.lorem.paragraph(),
                type: faker.helpers.arrayElement(['ADVISOR', 'REVIEWER', 'SESSION_HOST']),
                term_id: faker.number.int({ min: 1, max: 2 }),
            });
        });

        // GroupStudent
        forEach(new Array(30), async () => {
            await GroupStudent.create({
                name: faker.person.jobTitle(),
                status: faker.helpers.arrayElement([
                    'OPEN',
                    'FAIL_ADVISOR',
                    'FAIL_REVIEWER',
                    'FAIL_SESSION_HOST',
                    'PASS_ADVISOR',
                    'PASS_REVIEWER',
                    'PASS_SESSION_HOST',
                ]),
                typeReport: faker.helpers.arrayElement(['OPEN', 'POSTER', 'SESSION_HOST']),
                term_id: faker.number.int({ min: 1, max: 2 }),
                topic_id: faker.number.int({ min: 1, max: 30 }),
            });
        });

        // StudentTerm
        forEach(new Array(30), async () => {
            await StudentTerm.create({
                student_id: faker.number.int({ min: 1, max: 20 }),
                group_student_id: faker.number.int({ min: 1, max: 30 }),
                term_id: faker.number.int({ min: 1, max: 2 }),
            });
        });

        // Achievement
        forEach(new Array(10), async () => {
            const isAchievement = faker.number.int({ min: 1, max: 2 });
            if (isAchievement === 1) {
                await Achievement.create({
                    name: faker.person.jobTitle(),
                    bonusScore: faker.number.int({ min: 1, max: 10 }),
                    student_term_id: faker.number.int({ min: 1, max: 10 }),
                });
            }
        });

        // Transcript
        forEach(new Array(30), async () => {
            await Transcript.create({
                score: faker.number.int({ min: 1, max: 10 }),
                evaluation_id: faker.number.int({ min: 1, max: 10 }),
                student_term_id: faker.number.int({ min: 1, max: 30 }),
                lecturer_term_id: faker.number.int({ min: 1, max: 20 }),
            });
        });

        // Assign
        forEach(new Array(30), async () => {
            await Assign.create({
                typeEvaluation: faker.helpers.arrayElement(['ADVISOR', 'REVIEWER', 'SESSION_HOST']),
                group_student_id: faker.number.int({ min: 1, max: 30 }),
                group_lecturer_id: faker.number.int({ min: 1, max: 20 }),
            });
        });

        // NotificationLecturer
        forEach(new Array(20), async () => {
            await NotificationLecturer.create({
                message: faker.lorem.paragraph(),
                type: faker.helpers.arrayElement([
                    'UPDATE_STATUS_COMMENT_MY_TOPIC',
                    'ASSIGN_REVIEW',
                    'ASSIGN_SESSION_HOST',
                    'ASSIGN_ADVISOR',
                    'LECTURER',
                    'GROUP_STUDENT',
                    'CHOOSE_TOPIC',
                ]),
                lecturer_id: faker.number.int({ min: 1, max: 20 }),
            });
        });

        // NotificationStudent
        forEach(new Array(10), async () => {
            await NotificationStudent.create({
                message: faker.lorem.paragraph(),
                type: faker.helpers.arrayElement([
                    'ACHIEVEMENT',
                    'STUDENT',
                    'GROUP_STUDENT',
                    'SUBMIT_TOPIC',
                    'DISCUSSION',
                    'PUBLIC_RESULT',
                    'REPORT',
                    'CHOOSE_TOPIC',
                    'NEW_MEMBER',
                    'CHANGE_TYPE_REPORT_GROUP',
                ]),
                student_id: faker.number.int({ min: 1, max: 20 }),
            });
        });

        console.log('Insert data successfully!');
    } catch (error) {
        console.log(error);
    }
};

importData();

module.exports = importData;
