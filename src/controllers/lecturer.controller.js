const { Lecturer } = require('../models/index');
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
        const lecturer = await Lecturer.findOne({ where: { userName } });

        if (!lecturer) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }
        const flag = await comparePassword(password, lecturer.password);
        if (!flag) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }

        const accessToken = generateAccessToken(lecturer.id);
        const refreshToken = generateRefreshToken(lecturer.id);

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

exports.register = async (req, res) => {
    try {
        let { fullName, userName, password, majorId, email, phoneNumber } = req.body;
        password = await hashPassword(password);
        const lecturer = await Lecturer.create({
            fullName,
            userName,
            password,
            major_id: majorId,
            email,
            phoneNumber,
        });

        const accessToken = generateAccessToken(lecturer.id);
        const refreshToken = generateRefreshToken(lecturer.id);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Register Success',
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

// ----------------- Lecturer -----------------

exports.getLecturers = async (req, res) => {
    try {
        const { majorId } = req.query;
        let lecturers = null;
        if (majorId) {
            lecturers = await Lecturer.findAll({ where: { major_id: majorId } });
        } else {
            lecturers = await Lecturer.findAll();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            lecturers,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getLecturerById = async (req, res) => {
    try {
        const { id } = req.params;
        const lecturer = await Lecturer.findByPk(id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            lecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createLecturer = async (req, res) => {
    try {
        let { fullName, userName, password, majorId, email, phoneNumber } = req.body;
        password = await hashPassword(password);
        const lecturer = await Lecturer.create({
            fullName,
            userName,
            password,
            major_id: majorId,
            email,
            phoneNumber,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            lecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.changeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        let lecturer = await Lecturer.findByPk(id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        await Lecturer.update({ role }, { where: { id } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Change Role Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updatePassword = async (req, res) => {
    try {
        let { password, newPassword } = req.body;

        let lecturer = await Lecturer.findByPk(req.user.id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        const flag = await comparePassword(password, lecturer.password);
        if (!flag) {
            return Error.sendWarning(res, 'Password not match');
        }

        newPassword = await hashPassword(newPassword);

        await Lecturer.update({ password: newPassword }, { where: { id: req.user.id } });

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
        console.log(req.user.id);
        const lecturer = await Lecturer.findByPk(req.user.id);
        console.log(lecturer);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get Success',
            lecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { fullName, email, phoneNumber } = req.body;
        const lecturer = await Lecturer.findByPk(req.user.id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        await Lecturer.update({ fullName, email, phoneNumber }, { where: { id: req.user.id } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
