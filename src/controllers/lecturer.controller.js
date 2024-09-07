const { Lecturer, Major, LecturerTerm, Role } = require('../models/index');
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
const transporter = require('../configs/nodemailer');
const { validationResult } = require('express-validator');

// ----------------- Auth -----------------
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const lecturer = await Lecturer.findOne({ where: { username } });

        if (!lecturer) {
            return Error.sendNotFound(res, 'Tên đăng nhập không chính xác!');
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

        const roles = await Role.findAll({
            where: { lecturer_id: user.id },
            attributes: ['name'],
        });

        const accessToken = generateAccessToken(lecturer.id);
        const refreshToken = generateRefreshToken(lecturer.id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Đăng nhập thành công!',
            user,
            roles: roles.map((role) => role.name),
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
            message: 'Làm mới token thành công!',
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
            message: 'Đăng xuất thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

// ----------------- Admin -----------------

exports.searchLecturer = async (req, res) => {
    try {
        const { majorId, limit = 10, page = 1, searchField, keywords, sort = 'ASC' } = req.query;

        const validLimit = _.toInteger(limit) > 0 ? _.toInteger(limit) : 10;
        const validPage = _.toInteger(page) > 0 ? _.toInteger(page) : 1;
        const offset = (validPage - 1) * validLimit;

        const allowedSorts = ['ASC', 'DESC'];
        if (!allowedSorts.includes(sort.toUpperCase())) {
            return Error.sendNotFound(res, `Sort order "${sort}" không hợp lệ!`);
        }

        let searchQuery = '';
        if (searchField && keywords) {
            searchQuery = `AND l.${searchField} LIKE :keywords`;
        }

        const orderBy = sort ? `ORDER BY l.${searchField} ${sort}` : 'ORDER BY l.created_at DESC';

        const lecturers = await sequelize.query(
            `SELECT l.id, l.username, l.full_name AS fullName, l.phone, l.email, l.gender, l.degree, l.is_active AS isActive, l.major_id AS majorId, m.name AS majorName
            FROM lecturers l
            LEFT JOIN majors m ON l.major_id = m.id
            WHERE l.major_id = :majorId ${searchQuery} 
            ${orderBy}
            LIMIT :limit OFFSET :offset`,
            {
                replacements: {
                    majorId: majorId,
                    keywords: searchField === 'full_name' ? `%${keywords}` : `${keywords}%`,
                    limit: validLimit,
                    offset: offset,
                },
                type: QueryTypes.SELECT,
            },
        );

        const countResult = await sequelize.query(
            `SELECT COUNT(*) AS total
            FROM lecturers l
            LEFT JOIN majors m ON l.major_id = m.id
            WHERE l.major_id = :majorId ${searchQuery}`,
            {
                replacements: {
                    majorId: majorId,
                    keywords: searchField === 'full_name' ? `%${keywords}%` : `${keywords}%`,
                },
                type: QueryTypes.SELECT,
            },
        );

        const total = countResult[0].total;
        const totalPage = _.ceil(total / validLimit);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Tìm kiếm giảng viên thành công',
            lecturers,
            params: {
                page: validPage,
                limit: validLimit,
                totalPage,
            },
        });
    } catch (error) {
        console.log('🚀 ~ exports.searchLecturer= ~ error:', error);
        Error.sendError(res, error);
    }
};

exports.getLecturers = async (req, res) => {
    try {
        const { termId, majorId, page, limit } = req.query;
        let offset = (page - 1) * limit;

        let lecturers = [];
        let total = 0;

        if (majorId) {
            lecturers = await sequelize.query(
                `SELECT l.id, l.username, l.full_name as fullName, l.phone, l.email, l.gender, l.degree, l.is_active as isActive, l.major_id as majorId, m.name as majorName
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
                `SELECT l.id, l.username, l.full_name as fullName, l.phone, l.email, l.gender, l.degree, l.is_active as isActive, l.major_id as majorId, m.name as majorName
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
            message: 'Lấy danh sách giảng viên thành công!',
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

exports.getLecturersByMajorId = async (req, res) => {
    try {
        const { termId } = req.query;
        const { id } = req.params;

        const lecturers = await sequelize.query(
            `SELECT l.id, l.username, l.full_name as fullName, l.phone, l.email, l.gender, l.degree, l.is_active as isActive, l.major_id as majorId, m.name as majorName
                FROM lecturers l LEFT JOIN majors m ON l.major_id = m.id LEFT JOIN lecturer_terms lt ON l.id = lt.lecturer_id
                WHERE m.id = :majorId AND lt.term_id = :termId`,
            {
                replacements: { termId, majorId: id },
                type: QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách giảng viên theo chuyên ngành thành công!',
            lecturers,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createLecturer = async (req, res) => {
    try {
        let { username, fullName, gender, phone, email, degree, majorId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const password = await hashPassword('12345678');
        const lecturer_id = await Lecturer.findOne({
            where: {
                username,
            },
            attributes: ['id'],
        });

        if (lecturer_id) {
            return Error.sendConflict(res, 'Mã giảng viên không được phép trùng.');
        }

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

        await Role.create({
            lecturer_id: lecturer.id,
            name: 'LECTURER',
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

        const roles = await Role.findAll({
            where: { lecturer_id: lecturer.id },
            attributes: ['name'],
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo giảng viên thành công!',
            lecturer: newLecturer,
            roles: roles.map((role) => role.name),
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateLecturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, fullName, gender, phone, email, degree, majorId } = req.body;
        const lecturer = await Lecturer.findByPk(id);

        if (!lecturer) {
            return Error.sendNotFound(res, 'Giảng viên không tồn tại!');
        }

        const existedLecturer = await Lecturer.findOne({ where: { username } });
        if (existedLecturer && existedLecturer.id !== lecturer.id) {
            return Error.sendConflict(res, 'Mã giảng viên không được phép trùng.');
        }

        await lecturer.update({
            username,
            fullName,
            gender,
            phone,
            email,
            degree,
            major_id: majorId,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật giảng viên thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.importLecturers = async (req, res) => {
    try {
        const { majorId } = req.body;
        if (!req.file) {
            return Error.sendWarning(res, 'Hãy chọn file để import!');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        const password = await hashPassword('12345678');
        // columns: STT, Mã GV, Họ và tên, Giới tính, Số điện thoại, Email
        for (const lecturer of jsonData) {
            if (
                !lecturer['Mã GV'] ||
                !lecturer['Họ và tên'] ||
                !lecturer['Giới tính'] ||
                !lecturer['Số điện thoại'] ||
                !lecturer['Email']
            ) {
                return Error.sendWarning(
                    res,
                    'File không đúng định dạng! Bạn hãy kiểm tra lại tên cột trong file excel.',
                );
            }

            const username = lecturer['Mã GV'];
            const fullName = `${lecturer['Họ và tên']}`;
            const gender = lecturer['Giới tính'] === 'Nam' ? 'MALE' : 'FEMALE';
            const phone = lecturer['Số điện thoại'];
            const email = lecturer['Email'];
            const major_id = majorId;

            const existedLecturer = await Lecturer.findOne({ where: { username } });

            if (!existedLecturer) {
                const newLecturer = await Lecturer.create({
                    username,
                    password,
                    fullName,
                    gender,
                    phone,
                    email,
                    major_id,
                });

                await Role.create({
                    lecturer_id: newLecturer.id,
                    name: 'LECTURER',
                });
            }
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Nhâp danh sách giảng viên thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.exportLecturers = async (req, res) => {
    try {
        const { majorId } = req.query;

        if (!majorId) {
            return Error.sendWarning(res, 'Chuyên ngành không được để trống!');
        }

        const major = await Major.findByPk(majorId);
        if (!major) {
            return Error.sendNotFound(res, 'Chuyên ngành không tồn tại!');
        }

        // STT, Mã GV, Họ và tên, Giới tính, Số điện thoại, Email
        let lecturers = await sequelize.query(
            `SELECT l.username as 'Mã GV', l.full_name as 'Họ và tên', l.gender as 'Giới tính', l.phone as 'Số điện thoại', l.email as 'Email'
            FROM lecturers l
            WHERE l.major_id = :majorId`,
            {
                replacements: { majorId },
                type: QueryTypes.SELECT,
            },
        );

        for (let i = 0; i < lecturers.length; i++) {
            lecturers[i]['STT'] = i + 1;
            lecturers[i]['Giới tính'] = lecturers[i]['Giới tính'] === 'MALE' ? 'Nam' : 'Nữ';
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xuất danh sách giảng viên thành công!',
            lecturers,
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
            message: 'Xoá giảng viên thành công!',
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
            message: 'Làm mới mật khẩu thành công!',
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
            message: 'Khoá tài khoản thành công!',
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
            message: 'Mở khoá tài khoản thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.countLecturersByMajorId = async (req, res) => {
    try {
        const { majorId } = req.query;
        const count = await Lecturer.count({ where: { major_id: majorId } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng giảng viên của chuyên ngành thành công!',
            count,
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
            message: 'Lấy thông tin giảng viên thành công!',
            lecturer,
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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const flag = await comparePassword(password, req.user.password);
        if (!flag) {
            return Error.sendWarning(res, 'Mật khẩu không chính xác!');
        }

        newPassword = await hashPassword(newPassword);

        await Lecturer.update({ password: newPassword }, { where: { id: req.user.id } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật mật khẩu thành công!',
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
        const roles = await Role.findAll({
            where: { lecturer_id: lecturer.id },
            attributes: ['name'],
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin cá nhân thành công!',
            lecturer,
            roles: roles.map((role) => role.name),
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
            message: 'Cập nhật thông tin cá nhân thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { username } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const lecturer = await Lecturer.findOne({
            where: { username },
        });

        if (!lecturer) {
            return Error.sendNotFound(res, 'Mã giảng viên không tồn tại!');
        }

        if (!lecturer.email) {
            return Error.sendNotFound(
                res,
                'Tài khoản chưa cập nhật email! Bạn vui lòng liên hệ với giảng viên chủ quản để làm mới mật khẩu!',
            );
        }

        const generatePassword = Math.random().toString(36).slice(-8).toUpperCase();

        const newPassword = await hashPassword(generatePassword);

        lecturer.password = newPassword;
        await lecturer.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: lecturer.email,
            subject: 'Xác nhận mật khẩu mới',
            html: `
            <p>Mật khẩu mới của bạn là: ${generatePassword}</p>
          `,
        };

        await transporter.sendMail(mailOptions);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Bạn vui lòng kiểm tra email để nhận mật khẩu mới!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
