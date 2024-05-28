const { Lecturer, Major } = require('../models/index');
const Error = require('../helper/errors');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    removeRefreshToken,
} = require('../helper/jwt');
const { HTTP_STATUS } = require('../constants/constant');
const { comparePassword, hashPassword } = require('../helper/bcrypt');
const _ = require('lodash');
const xlsx = require('xlsx');

// ----------------- Auth -----------------
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const lecturer = await Lecturer.findOne({ where: { username } });

        if (!lecturer) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }
        const flag = await comparePassword(password, lecturer.password);
        if (!flag) {
            return Error.sendNotFound(res, 'Invalid email or password');
        }

        const user = await Lecturer.findOne({
            where: { username },
            attributes: { exclude: ['password', 'created_at', 'updated_at'] },
        });

        const accessToken = generateAccessToken(lecturer.id);
        const refreshToken = generateRefreshToken(lecturer.id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login Success',
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
        const lecturer = req.user;
        removeRefreshToken(lecturer.id);
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

exports.getLecturers = async (req, res) => {
    try {
        const { majorId } = req.query;
        let lecturers = null;
        if (majorId) {
            lecturers = await Lecturer.findAll({
                where: { major_id: majorId },
                attributes: { exclude: ['password', 'created_at', 'updated_at', 'major_id'] },
                include: [
                    {
                        model: Major,
                        attributes: ['id', 'name'],
                        as: 'major',
                    },
                ],
            });
        } else {
            lecturers = await Lecturer.findAll({
                attributes: { exclude: ['password', 'created_at', 'updated_at', 'major_id'] },
                include: [
                    {
                        model: Major,
                        attributes: ['id', 'name'],
                        as: 'major',
                    },
                ],
            });
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

exports.getLecturersByParams = async (req, res) => {
    const { page, limit } = req.query;
    try {
        var offset = (page - 1) * limit;
        const lecturers = await Lecturer.findAll({
            offset: offset,
            limit: parseInt(limit),
        });
        var totalPage = lecturers.length;

        totalPage = _.ceil(totalPage / _.toInteger(limit));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get all lecturers by params success',
            lecturers,
            params: {
                page: _.toInteger(page),
                limit: _.toInteger(limit),
                totalPage,
            },
        });
    } catch (error) {
        console.log('🚀 ~ exports.getLecturersByParams= ~ error:', error);
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
        let { id, fullName, gender, phone, email, majorId } = req.body;
        const password = await hashPassword('12345678');
        const lecturer = await Lecturer.create({
            id,
            fullName,
            username: id,
            password,
            gender,
            email,
            phone,
            major_id: majorId,
        });

        const newLecturer = await Lecturer.findByPk(lecturer.id, {
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'major_id'] },
            include: [
                {
                    model: Major,
                    attributes: ['id', 'name'],
                    as: 'major',
                },
            ],
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Create Success',
            lecturer: newLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, gender, phone, email, majorId } = req.body;
        const lecturer = await Lecturer.findByPk(id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        lecturer.fullName = fullName;
        lecturer.gender = gender;
        lecturer.phone = phone;
        lecturer.email = email;
        lecturer.major_id = majorId;

        await lecturer.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
            lecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importLecturers = async (req, res) => {
    try {
        const { majorId, termId } = req.body;
        if (!req.file) {
            return Error.sendWarning(res, 'Please upload a file');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        const lecturers = [];
        const password = await hashPassword('12345678');
        // columns: STT, Mã GV, Họ và tên, Giới tính, Số điện thoại, Email
        jsonData.forEach(async (lecturer) => {
            const id = lecturer['Mã GV'];
            const fullName = `${lecturer['Họ và tên']}`;
            const gender = lecturer['Giới tính'] === 'Nam' ? 'MALE' : 'FEMALE';
            const phone = lecturer['Số điện thoại'];
            const email = lecturer['Email'];
            const username = id;
            const major_id = majorId;

            lecturers.push({
                id,
                username,
                password,
                fullName,
                gender,
                phone,
                email,
                major_id,
            });
        });

        // Create lecturers
        await Lecturer.bulkCreate(lecturers);

        const newLecturers = await Lecturer.findAll({
            where: { major_id: majorId },
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'major_id'] },
            include: [
                {
                    model: Major,
                    attributes: ['id', 'name'],
                    as: 'major',
                },
            ],
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import Success',
            lecturers: newLecturers,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.deleteLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const lecturer = await Lecturer.findByPk(id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        await lecturer.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete Success',
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

// ----------------- Lecturer -----------------

exports.updatePassword = async (req, res) => {
    try {
        let { password, newPassword } = req.body;

        let lecturer = req.user;
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
        const lecturer = req.user;
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
        const lecturer = req.user;
        if (!lecturer) {
            return Error.sendNotFound(res, 'Lecturer not found');
        }

        await Lecturer.update({ fullName, email, phoneNumber }, { where: { id: lecturer.id } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update Success',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
