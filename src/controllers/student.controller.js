const { Student, Major, StudentTerm, GroupStudent } = require('../models/index');
const Error = require('../helper/errors');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    removeRefreshToken,
} = require('../helper/jwt');
const { HTTP_STATUS } = require('../constants/constant');
const { comparePassword, hashPassword } = require('../helper/bcrypt');
const xlsx = require('xlsx');
const moment = require('moment');
const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

// ----------------- Auth -----------------
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const student = await Student.findOne({
            where: { username },
        });

        if (!student) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }
        const flag = await comparePassword(password, student.password);
        if (!flag) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }

        const user = await Student.findOne({
            where: { username },
            attributes: {
                exclude: ['password', 'created_at', 'updated_at', 'major_id', 'major'],
                include: [
                    ['major_id', 'majorId'],
                    [sequelize.col('major.name'), 'majorName'],
                ],
            },
            include: [
                {
                    model: Major,
                    attributes: [],
                    as: 'major',
                },
            ],
        });

        const accessToken = generateAccessToken(student.id);
        const refreshToken = generateRefreshToken(student.id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login successfully',
            user,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return Error.sendBadRequest(res, 'Invalid token');
        }

        const { id } = verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken(id);
        const newRefreshToken = generateRefreshToken(id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Refresh Token successfully',
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.logout = async (req, res) => {
    try {
        removeRefreshToken(req.user.id);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Logout successfully',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

// ----------------- Admin -----------------

exports.getStudents = async (req, res) => {
    try {
        const { termId, majorId, page, limit } = req.query;
        let offset = (page - 1) * limit;

        let students = [];
        if (majorId) {
            students = await sequelize.query(
                `SELECT st.id, st.username, st.full_name as fullName, st.avatar, st.phone, st.email, st.gender, st.date_of_birth as dateOfBirth, st.clazz_name as clazzName, st.type_training as typeTraining, st.is_active as isActive, st.major_id as majorId, m.name as majorName
                FROM students st LEFT JOIN majors m ON st.major_id = m.id LEFT JOIN student_terms stt ON st.id = stt.student_id
                WHERE m.id = :majorId AND stt.term_id = :termId
                ORDER BY st.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    replacements: { majorId, termId, limit: parseInt(limit), offset },
                    type: QueryTypes.SELECT,
                },
            );
        } else {
            students = await sequelize.query(
                `SELECT st.id, st.username, st.full_name as fullName, st.avatar, st.phone, st.email, st.gender, st.date_of_birth as dateOfBirth, st.clazz_name as clazzName, st.type_training as typeTraining, st.is_active as isActive, st.major_id as majorId, m.name as majorName
                FROM students st LEFT JOIN majors m ON st.major_id = m.id LEFT JOIN student_terms stt ON st.id = stt.student_id
                WHERE stt.term_id = :termId
                ORDER BY st.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    replacements: { termId, limit: parseInt(limit), offset },
                    type: QueryTypes.SELECT,
                },
            );
        }

        let totalPage = students.length;

        totalPage = _.ceil(totalPage / _.toInteger(limit));

        students = students.map((stu) => {
            return {
                ...stu,
                isActive: Boolean(stu.isActive),
            };
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get all students successfully',
            students,
            params: {
                page: _.toInteger(page),
                limit: _.toInteger(limit),
                totalPage,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findOne({
            where: { id },
            attributes: {
                exclude: ['password', 'created_at', 'updated_at', 'major_id', 'major'],
                include: [
                    ['major_id', 'majorId'],
                    [sequelize.col('major.name'), 'majorName'],
                ],
            },
            include: [
                {
                    model: Major,
                    attributes: [],
                    as: 'major',
                },
            ],
        });

        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get student by id successfully',
            student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createStudent = async (req, res) => {
    try {
        let { id, fullName, gender, dateOfBirth, phone, typeTraining, clazzName, majorId, termId } =
            req.body;
        const password = await hashPassword('12345678');
        const student = await Student.create({
            id,
            fullName,
            username: id,
            password,
            gender,
            date_of_birth: dateOfBirth,
            phone,
            major_id: majorId,
            type_training: typeTraining,
            clazz_name: clazzName,
        });

        await StudentTerm.create({
            student_id: student.id,
            term_id: termId,
        });

        const newStudent = await Student.findOne({
            where: { id },
            attributes: {
                exclude: ['password', 'created_at', 'updated_at', 'major_id', 'major'],
                include: [
                    ['major_id', 'majorId'],
                    [sequelize.col('major.name'), 'majorName'],
                ],
            },
            include: [
                {
                    model: Major,
                    attributes: [],
                    as: 'major',
                },
            ],
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create student successfully',
            student: newStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        let { fullName, gender, phone, dateOfBirth, majorId, typeTraining, clazzName } = req.body;
        const student = await Student.findByPk(id);
        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        student.fullName = fullName;
        student.gender = gender;
        student.date_of_birth = dateOfBirth;
        student.phone = phone;
        student.major_id = majorId;
        student.type_training = typeTraining;
        student.clazz_name = clazzName;

        await student.save();

        const newStudent = await Student.findOne({
            where: { id },
            attributes: {
                exclude: ['password', 'created_at', 'updated_at', 'major_id', 'major'],
                include: [
                    ['major_id', 'majorId'],
                    [sequelize.col('major.name'), 'majorName'],
                ],
            },
            include: [
                {
                    model: Major,
                    attributes: [],
                    as: 'major',
                },
            ],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update student successfully',
            student: newStudent,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importStudents = async (req, res) => {
    try {
        const { majorId, termId } = req.body;
        if (!req.file) {
            return Error.sendWarning(res, 'Please upload a file');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        const students = [];
        const password = await hashPassword('12345678');
        // columns: STT, Mã SV, Họ đệm, Tên, Giới tính, Ngày sinh, Số điện thoại, Mã lớp
        jsonData.forEach(async (student) => {
            const id = student['Mã SV'];
            const fullName = `${student['Họ đệm']} ${student['Tên']}`;
            const gender = student['Giới tính'] === 'Nam' ? 'MALE' : 'FEMALE';
            const dateOfBirth = moment(student['Ngày sinh'], 'DD/MM/YYYY').format('YYYY-MM-DD');
            const phone = student['Số điện thoại'];
            const clazzName = student['Mã lớp'];
            const username = id;
            const major_id = majorId;

            students.push({
                id,
                username,
                password,
                fullName,
                gender,
                dateOfBirth,
                phone,
                clazzName,
                major_id,
            });
        });

        // Create students
        await Student.bulkCreate(students);

        // Create student term
        students.forEach(async (student) => {
            await StudentTerm.create({
                student_id: student.id,
                term_id: termId,
            });
        });

        // Create group student
        students.forEach(async (student) => {
            await GroupStudent.create({
                name: `Nhóm số ${students.indexOf(student) + 1}`,
                term_id: termId,
            });
        });

        const newStudents = await Student.findAll({
            attributes: {
                exclude: ['password', 'created_at', 'updated_at', 'major_id', 'major'],
                include: [
                    ['major_id', 'majorId'],
                    [sequelize.col('major.name'), 'majorName'],
                ],
            },
            include: [
                {
                    model: Major,
                    attributes: [],
                    as: 'major',
                },
            ],
            offset: 0,
            limit: 10,
        });

        let totalPage = newStudents.length;

        totalPage = _.ceil(totalPage / _.toInteger(10));

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import students successfully',
            students: newStudents,
            params: {
                page: 1,
                limit: _.toInteger(10),
                totalPage,
            },
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);
        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        await student.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete student successfully',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.body;
        const password = await hashPassword('12345678');
        const student = await Student.findByPk(id);
        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        await student.update({ password });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Reset password student successfully',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

// ----------------- Student -----------------

exports.updatePassword = async (req, res) => {
    try {
        let { password, newPassword } = req.body;

        let student = await Student.findByPk(req.user.id);
        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        const flag = await comparePassword(password, student.password);
        if (!flag) {
            return Error.sendWarning(res, 'Password not match');
        }

        newPassword = await hashPassword(newPassword);

        await student.update({ password: newPassword }, { where: { id: req.user.id } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update password student successfully',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getMe = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.id, {
            attributes: {
                exclude: ['password', 'created_at', 'updated_at', 'major_id', 'major'],
                include: [
                    ['major_id', 'majorId'],
                    [sequelize.col('major.name'), 'majorName'],
                ],
            },
            include: [
                {
                    model: Major,
                    attributes: [],
                    as: 'major',
                },
            ],
        });

        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get me successfully',
            user: student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, avatarUrl, gender } = req.body;
        const student = await Student.findOne({
            where: { id: req.user.id },
            attributes: { exclude: ['password'] },
        });

        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        await student.update(
            { fullName, email, phoneNumber, gender, avatarUrl },
            { where: { id: req.user.id } },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update me successfully',
            user: student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
