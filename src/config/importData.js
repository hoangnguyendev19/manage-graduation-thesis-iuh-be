const { forEach } = require('lodash');
const { fakerVI } = require('@faker-js/faker');
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
} = require('../schema/index');

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
    try {
        // Major
        await Promise.all(
            majorList.map(async (major) => {
                await Major.create({
                    name: major.name,
                });
            }),
        );

        // Student
        const majors = await Major.findAll();
        forEach(new Array(10), async () => {
            const major = faker.helpers.arrayElement(majors);
            await Student.create({
                userName: faker.internet.userName(),
                password: '12345678',
                fullName: faker.person.fullName(),
                avatarUrl: faker.image.avatar(),
                phoneNumber: faker.phone.number(),
                email: faker.internet.email(),
                gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
                schoolYear: faker.helpers.arrayElement(['2021-2025', '2022-2026', '2023-2027']),
                typeTraining: faker.helpers.arrayElement(['COLLEGE', 'UNIVERSITY']),
                major_id: major.id,
            });
        });

        // Lecturer
        forEach(new Array(10), async () => {
            const major = faker.helpers.arrayElement(majors);
            await Lecturer.create({
                userName: faker.internet.userName(),
                password: '12345678',
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
                major_id: major.id,
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
        const lecturers = await Lecturer.findAll();
        const terms = await Term.findAll();
        console.log(lecturers, terms);
        forEach(lecturers, async (lecturer) => {
            forEach(terms, async (term) => {
                await LecturerTerm.create({
                    role: faker.helpers.arrayElement([
                        'HEAD_LECTURER',
                        'LECTURER',
                        'SUB_HEAD_LECTURER',
                    ]),
                    lecturer_id: lecturer.id,
                    term_id: term.id,
                });
            });
        });

        // // Topic
        // const lecturerTerms = await LecturerTerm.findAll();
        // forEach(lecturerTerms, async (lecturerTerm) => {
        //     forEach(new Array(3), async () => {
        //         await Topic.create({
        //             name: faker.person.jobTitle(),
        //             description: faker.lorem.paragraph(),
        //             quantityGroupMax: faker.helpers.number(),
        //             note: faker.lorem.paragraph(),
        //             target: faker.lorem.paragraph(),
        //             standardOutput: faker.lorem.paragraph(),
        //             requireInput: faker.lorem.paragraph(),
        //             comment: faker.lorem.paragraph(),
        //             status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED']),
        //             level: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
        //             lecturer_term_id: lecturerTerm.id,
        //         });
        //     });
        // });

        // // GroupLecturer
        // forEach(terms, async (term) => {
        //     forEach(new Array(5), async () => {
        //         await GroupLecturer.create({
        //             name: faker.person.jobTitle(),
        //             type: faker.helpers.arrayElement(['ADVISOR', 'REVIEWER', 'SESSION_HOST']),
        //             term_id: term.id,
        //         });
        //     });
        // });

        // // GroupLecturerMember
        // const groupLecturers = await GroupLecturer.findAll();
        // forEach(groupLecturers, async (groupLecturer) => {
        //     forEach(lecturerTerms, async (lecturerTerm) => {
        //         await GroupLecturerMember.create({
        //             group_lecturer_id: groupLecturer.id,
        //             lecturer_term_id: lecturerTerm.id,
        //         });
        //     });
        // });

        // // Evaluation
        // forEach(terms, async (term) => {
        //     forEach(new Array(5), async () => {
        //         await Evaluation.create({
        //             name: faker.person.jobTitle(),
        //             scoreMax: faker.helpers.rangeToNumber(1, 10),
        //             description: faker.lorem.paragraph(),
        //             type: faker.helpers.arrayElement(['ADVISOR', 'REVIEWER', 'SESSION_HOST']),
        //             term_id: term.id,
        //         });
        //     });
        // });

        // // GroupStudent
        // const topics = await Topic.findAll();
        // forEach(topics, async (topic) => {
        //     forEach(terms, async (term) => {
        //         await GroupStudent.create({
        //             name: faker.person.jobTitle(),
        //             status: faker.helpers.arrayElement([
        //                 'OPEN',
        //                 'FAIL_ADVISOR',
        //                 'FAIL_REVIEWER',
        //                 'FAIL_SESSION_HOST',
        //                 'PASS_ADVISOR',
        //                 'PASS_REVIEWER',
        //                 'PASS_SESSION_HOST',
        //             ]),
        //             typeReport: faker.helpers.arrayElement(['OPEN', 'POSTER', 'SESSION_HOST']),
        //             term_id: term.id,
        //             topic_id: topic.id,
        //         });
        //     });
        // });

        // // StudentTerm
        // const students = await Student.findAll();
        // const groupStudents = await GroupStudent.findAll();
        // for (const term of terms) {
        //     for (const student of students) {
        //         for (const groupStudent of groupStudents) {
        //             await StudentTerm.create({
        //                 student_id: student.id,
        //                 group_student_id: groupStudent.id,
        //                 term_id: term.id,
        //             });
        //             break;
        //         }
        //     }
        // }

        // // Achievement
        // const studentTerms = await StudentTerm.findAll();
        // forEach(studentTerms, async (studentTerm) => {
        //     const isAchievement = faker.random.boolean();
        //     if (isAchievement) {
        //         await Achievement.create({
        //             name: faker.person.jobTitle(),
        //             bonusScore: faker.helpers.rangeToNumber(1, 10),
        //             student_term_id: studentTerm.id,
        //         });
        //     }
        // });

        // // Transcript
        // const evaluations = await Evaluation.findAll();
        // forEach(studentTerms, async (studentTerm) => {
        //     forEach(evaluations, async (evaluation) => {
        //         await Transcript.create({
        //             score: faker.helpers.rangeToNumber(1, 10),
        //             evaluation_id: evaluation.id,
        //             student_term_id: studentTerm.id,
        //         });
        //     });
        // });

        // // Assign
        // forEach(groupLecturers, async (groupLecturer) => {
        //     forEach(groupStudents, async (groupStudent) => {
        //         await Assign.create({
        //             type: faker.helpers.arrayElement(['ADVISOR', 'REVIEWER', 'SESSION_HOST']),
        //             group_lecturer_id: groupLecturer.id,
        //             group_student_id: groupStudent.id,
        //         });
        //     });
        // });

        // // NotificationLecturer
        // forEach(lecturers, async (lecturer) => {
        //     forEach(new Array(5), async () => {
        //         await NotificationLecturer.create({
        //             message: faker.lorem.paragraph(),
        //             type: faker.helpers.arrayElement([
        //                 'UPDATE_STATUS_COMMENT_MY_TOPIC',
        //                 'ASSIGN_REVIEW',
        //                 'ASSIGN_SESSION_HOST',
        //                 'ASSIGN_ADVISOR',
        //                 'LECTURER',
        //                 'GROUP_STUDENT',
        //                 'CHOOSE_TOPIC',
        //             ]),
        //             lecturer_id: lecturer.id,
        //         });
        //     });
        // });

        // // NotificationStudent
        // forEach(students, async (student) => {
        //     forEach(new Array(5), async () => {
        //         await NotificationStudent.create({
        //             message: faker.lorem.paragraph(),
        //             type: faker.helpers.arrayElement([
        //                 'ACHIEVEMENT',
        //                 'STUDENT',
        //                 'GROUP_STUDENT',
        //                 'SUBMIT_TOPIC',
        //                 'DISCUSSION',
        //                 'PUBLIC_RESULT',
        //                 'REPORT',
        //                 'CHOOSE_TOPIC',
        //                 'NEW_MEMBER',
        //                 'CHANGE_TYPE_REPORT_GROUP',
        //             ]),
        //             student_id: student.id,
        //         });
        //     });
        // });

        console.log('Import data successfully!');
    } catch (error) {
        console.log(error);
    }
};

importData();

module.exports = importData;
