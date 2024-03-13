const { Student } = require('../../schema/index');
const Error = require('../../handler/errors');
const { generateAccessToken, generateRefreshToken } = require('../../handler/jwt');
const { HTTP_STATUS } = require('../../constants/constant');
const { comparePassword, hashPassword } = require('../../handler/bcrypt');

// ----------------- Auth -----------------
exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;
        const student = await Student.findOne({ where: { userName } });

        if (!student) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }
        const flag = await comparePassword(password, student.password);
        if (!flag) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }

        const accessToken = generateAccessToken(student.id);
        const refreshToken = generateRefreshToken(student.id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login Success',
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

// ----------------- Student -----------------

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            students,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);
        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createStudent = async (req, res) => {
    try {
        let { fullName, userName, password, majorId, email, phoneNumber, typeTraining } = req.body;
        password = await hashPassword(password);
        const student = await Student.create({
            fullName,
            userName,
            password,
            email,
            phoneNumber,
            major_id: majorId,
            type_training: typeTraining,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

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
            message: 'Update Password Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getMe = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.id);
        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { fullName, email, phoneNumber } = req.body;
        const student = await Student.findByPk(req.user.id);
        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        await student.update({ fullName, email, phoneNumber }, { where: { id: req.user.id } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
