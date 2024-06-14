const { Lecturer, Major, LecturerTerm } = require('../models/index');
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
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

// ----------------- Auth -----------------
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const lecturer = await Lecturer.findOne({ where: { username } });

        if (!lecturer) {
            return Error.sendNotFound(res, 'Email hoặc mật khẩu không chính xác!');
        }
        const flag = await comparePassword(password, lecturer.password);
        if (!flag) {
            return Error.sendNotFound(res, 'Mật khẩu không chính xác!');
        }

        const user = await Lecturer.findOne({
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

        const accessToken = generateAccessToken(lecturer.id);
        const refreshToken = generateRefreshToken(lecturer.id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login success!',
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
            return Error.sendWarning(res, 'Token không hợp lệ!');
        }

        const { id } = verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken(id);
        const newRefreshToken = generateRefreshToken(id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Refresh token success!',
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
            message: 'Logout success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

// ----------------- Admin -----------------

exports.getLecturers = async (req, res) => {
    try {
        const { termId, majorId, page, limit } = req.query;
        let offset = (page - 1) * limit;

        let lecturers = [];
        let total = 0;

        if (majorId) {
            lecturers = await sequelize.query(
                `SELECT l.id, l.username, l.full_name as fullName, l.avatar, l.phone, l.email, l.gender, l.degree, l.role, l.is_admin as isAdmin, l.is_active as isActive, l.major_id as majorId, m.name as majorName
                FROM lecturers l LEFT JOIN majors m ON l.major_id = m.id LEFT JOIN lecturer_terms lt ON l.id = lt.lecturer_id
                WHERE m.id = :majorId AND lt.term_id = :termId
                ORDER BY l.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    replacements: { majorId, termId, limit: parseInt(limit), offset },
                    type: QueryTypes.SELECT,
                },
            );

            total = await LecturerTerm.count({
                where: { term_id: termId },
                include: [
                    {
                        model: Lecturer,
                        where: { major_id: majorId },
                        as: 'lecturer',
                    },
                ],
            });
        } else {
            lecturers = await sequelize.query(
                `SELECT l.id, l.username, l.full_name as fullName, l.avatar, l.phone, l.email, l.gender, l.degree, l.role, l.is_admin as isAdmin, l.is_active as isActive, l.major_id as majorId, m.name as majorName
                FROM lecturers l LEFT JOIN majors m ON l.major_id = m.id LEFT JOIN lecturer_terms lt ON l.id = lt.lecturer_id
                WHERE lt.term_id = :termId
                ORDER BY l.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    replacements: { termId, limit: parseInt(limit), offset },
                    type: QueryTypes.SELECT,
                },
            );

            total = await LecturerTerm.count({
                where: { term_id: termId },
            });
        }

        const totalPage = _.ceil(total / _.toInteger(limit));

        lecturers = lecturers.map((lec) => {
            return {
                ...lec,
                isAdmin: Boolean(lec.isAdmin),
                isActive: Boolean(lec.isActive),
            };
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get all lecturers success!',
            lecturers,
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

exports.getLecturerById = async (req, res) => {
    try {
        const { id } = req.params;
        const lecturer = await Lecturer.findOne({
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

        if (!lecturer) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get lecturer by id success!',
            lecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createLecturer = async (req, res) => {
    try {
        let { username, fullName, gender, phone, email, degree, majorId, termId } = req.body;
        const password = await hashPassword('12345678');
        const lecturer = await Lecturer.create({
            username,
            fullName,
            password,
            gender,
            email,
            phone,
            degree,
            major_id: majorId,
        });

        await LecturerTerm.create({
            lecturer_id: lecturer.id,
            term_id: termId,
        });

        let newLecturer = await Lecturer.findOne({
            where: { id: lecturer.id },
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
            message: 'Create lecturer success!',
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
        const { fullName, gender, phone, email, degree, majorId } = req.body;
        const lecturer = await Lecturer.findByPk(id);

        if (!lecturer) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        await lecturer.update({ fullName, gender, phone, email, degree, major_id: majorId });

        const newLecturer = await Lecturer.findOne({
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
            message: 'Update lecturer success!',
            lecturer: newLecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importLecturers = async (req, res) => {
    try {
        const { termId, majorId } = req.body;
        if (!req.file) {
            return Error.sendWarning(res, 'Hãy chọn file để import!');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        const lecturers = [];
        const password = await hashPassword('12345678');
        // columns: STT, Mã GV, Họ và tên, Giới tính, Số điện thoại, Email
        jsonData.forEach(async (lecturer) => {
            const username = lecturer['Mã GV'];
            const fullName = `${lecturer['Họ và tên']}`;
            const gender = lecturer['Giới tính'] === 'Nam' ? 'MALE' : 'FEMALE';
            const phone = lecturer['Số điện thoại'];
            const email = lecturer['Email'];
            const major_id = majorId;

            lecturers.push({
                username,
                password,
                fullName,
                gender,
                phone,
                email,
                major_id,
            });
        });

        const lecturerTerms = await LecturerTerm.findAll({
            where: { term_id: termId },
        });

        if (lecturerTerms.length !== 0) {
            lecturers.forEach(async (lec) => {
                const lecturer = await Lecturer.findOne({
                    where: { username: lec.username },
                });

                if (!lecturer) {
                    const newLecturer = await Lecturer.create(lec);
                    await LecturerTerm.create({
                        lecturer_id: newLecturer.id,
                        term_id: termId,
                    });
                } else {
                    const lecturerTerm = await LecturerTerm.findOne({
                        where: { lecturer_id: lecturer.id, term_id: termId },
                    });

                    if (!lecturerTerm) {
                        await LecturerTerm.create({
                            lecturer_id: lecturer.id,
                            term_id: termId,
                        });
                    }
                }
            });
        } else {
            lecturers.forEach(async (lec) => {
                const lecturer = await Lecturer.findOne({
                    where: { username: lec.username },
                });

                if (!lecturer) {
                    const newLecturer = await Lecturer.create(lec);

                    await LecturerTerm.create({
                        lecturer_id: newLecturer.id,
                        term_id: termId,
                    });
                } else {
                    await LecturerTerm.create({
                        lecturer_id: lecturer.id,
                        term_id: termId,
                    });
                }
            });
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Import lecturers success!',
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
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        await lecturer.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete lecturer success!',
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
        const lecturer = await Lecturer.findByPk(id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        await lecturer.update({ password });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Reset password lecturer success!',
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
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        await lecturer.update({ role });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Change role success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.lockAccount = async (req, res) => {
    try {
        const { id } = req.body;
        let lecturer = await Lecturer.findByPk(id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        await lecturer.update({ isActive: false });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lock account success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.unlockAccount = async (req, res) => {
    try {
        const { id } = req.body;
        let lecturer = await Lecturer.findByPk(id);
        if (!lecturer) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        await lecturer.update({ isActive: true });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Unlock account success!',
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

        const flag = await comparePassword(password, req.user.password);
        if (!flag) {
            return Error.sendWarning(res, 'Mật khẩu không chính xác!');
        }

        newPassword = await hashPassword(newPassword);

        await Lecturer.update({ password: newPassword }, { where: { id: req.user.id } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update password success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getMe = async (req, res) => {
    try {
        const lecturer = await Lecturer.findOne({
            where: { id: req.user.id },
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
            message: 'Get me success!',
            lecturer,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { fullName, email, phone, gender } = req.body;

        await Lecturer.update({ fullName, email, phone, gender }, { where: { id: req.user.id } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update me success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
