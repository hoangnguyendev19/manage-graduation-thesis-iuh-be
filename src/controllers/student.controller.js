const { Student, Major } = require('../models/index');
const Error = require('../helper/errors');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    removeRefreshToken,
} = require('../helper/jwt');
const { HTTP_STATUS } = require('../constants/constant');
const { comparePassword, hashPassword } = require('../helper/bcrypt');

// ----------------- Auth -----------------
exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;
        const student = await Student.findOne({
            where: { userName },
        });

        if (!student) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }
        const flag = await comparePassword(password, student.password);
        if (!flag) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }

        const user = await Student.findOne({
            where: { userName },
            attributes: { exclude: ['password'] },
        });

        const accessToken = generateAccessToken(student.id);
        const refreshToken = generateRefreshToken(student.id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login Success',
            accessToken,
            refreshToken,
            user,
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
            message: 'Refresh Token Success',
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
            message: 'Logout Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

// ----------------- Admin -----------------

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'major_id'] },
            include: [
                {
                    model: Major,
                    attributes: ['id', 'name'],
                    as: 'major',
                },
            ],
        });

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
        let { id, fullName, gender, phone, email, majorId, typeTraining, schoolYear } = req.body;
        const password = await hashPassword(id);
        const student = await Student.create({
            id,
            fullName,
            username: id,
            password,
            gender,
            email,
            phone,
            major_id: majorId,
            type_training: typeTraining,
            school_year: schoolYear,
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

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        let { fullName, gender, phone, email, majorId, typeTraining, schoolYear } = req.body;
        const student = await Student.findByPk(id);
        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        student.id = id;
        student.fullName = fullName;
        student.gender = gender;
        student.phone = phone;
        student.email = email;
        student.major_id = majorId;
        student.type_training = typeTraining;
        student.school_year = schoolYear;

        await student.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            student,
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
            message: 'Delete Success',
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
            message: 'Update Password Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getMe = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
        });

        if (!student) {
            return Error.sendNotFound(res, 'Student not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
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
            message: 'Update Success',
            user: student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
