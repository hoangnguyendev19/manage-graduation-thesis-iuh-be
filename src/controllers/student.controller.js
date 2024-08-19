const { Student, Major, StudentTerm, Term } = require('../models/index');
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
const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const transporter = require('../configs/nodemailer');
const { validationResult } = require('express-validator');
const moment = require('moment');

// ----------------- Auth -----------------
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const student = await Student.findOne({
            where: { username },
        });

        if (!student) {
            return Error.sendNotFound(res, 'Tên đăng nhập không chính xác!');
        }
        const flag = await comparePassword(password, student.password);
        if (!flag) {
            return Error.sendNotFound(res, 'Mật khẩu không chính xác!');
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
            message: 'Đăng nhập thành công!',
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
        removeRefreshToken(req.user.id);
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
exports.getStudentsOfSearch = async (req, res) => {
    try {
        const { termId, majorId, page, limit, keywords, searchField } = req.query;
        let offset = (page - 1) * limit;
        let students = [];
        let total = 0;

        let replacements = {
            termId: termId,
            keywords: searchField === 'full_name' ? `%${keywords}` : `${keywords}%`,
            limit: _.toInteger(limit),
            offset: offset,
        };

        let searchQuery = searchField ? `AND st.${searchField} like :keywords` : '';

        let initQUery = `SELECT st.id, st.username, st.full_name as fullName, st.phone, st.email, st.gender, st.date_of_birth as dateOfBirth, st.clazz_name as clazzName, st.type_training as typeTraining, st.is_active as isActive, st.major_id as majorId, m.name as majorName
                FROM students st LEFT JOIN majors m ON st.major_id = m.id LEFT JOIN student_terms stt ON st.id = stt.student_id
                WHERE m.id = :majorId AND stt.term_id = :termId ${searchQuery}
                ORDER BY st.created_at DESC
                LIMIT :limit OFFSET :offset`;
        let countQuery = `
        SELECT COUNT(*) as count
        FROM students st
        LEFT JOIN majors m ON st.major_id = m.id
        LEFT JOIN student_terms stt ON st.id = stt.student_id
        WHERE stt.term_id = :termId ${searchQuery}
        `;

        if (majorId) {
            students = await sequelize.query(initQUery, {
                replacements: { ...replacements, majorId: majorId },
                type: QueryTypes.SELECT,
            });

            let countResult = await sequelize.query(countQuery, {
                replacements: { ...replacements, majorId: majorId },
                type: QueryTypes.SELECT,
            });
            total = countResult[0].count;
        } else {
            let searchQuery = searchField ? `AND st.${searchField} like :keywords` : '';

            students = await sequelize.query(initQUery, {
                replacements: replacements,
                type: QueryTypes.SELECT,
            });
            let countResult = await sequelize.query(countQuery, {
                replacements: replacements,
                type: QueryTypes.SELECT,
            });
            total = countResult[0].count;
        }

        const totalPage = _.ceil(total / _.toInteger(limit));

        students = students.map((stu) => {
            return {
                ...stu,
                isActive: Boolean(stu.isActive),
            };
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách sinh viên thành công!',
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

exports.getStudents = async (req, res) => {
    try {
        const { termId, majorId, page, limit } = req.query;
        let offset = (page - 1) * limit;

        let students = [];
        let total = 0;

        if (majorId) {
            students = await sequelize.query(
                `SELECT st.id, st.username, st.full_name as fullName, st.phone, st.email, st.gender, st.date_of_birth as dateOfBirth, st.clazz_name as clazzName, st.type_training as typeTraining, st.is_active as isActive, st.major_id as majorId, m.name as majorName
                FROM students st LEFT JOIN majors m ON st.major_id = m.id LEFT JOIN student_terms stt ON st.id = stt.student_id
                WHERE m.id = :majorId AND stt.term_id = :termId
                ORDER BY st.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    replacements: { majorId, termId, limit: parseInt(limit), offset },
                    type: QueryTypes.SELECT,
                },
            );

            total = await StudentTerm.count({
                where: { term_id: termId },
                include: [
                    {
                        model: Student,
                        where: { major_id: majorId },
                        as: 'student',
                    },
                ],
            });
        } else {
            students = await sequelize.query(
                `SELECT st.id, st.username, st.full_name as fullName, st.phone, st.email, st.gender, st.date_of_birth as dateOfBirth, st.clazz_name as clazzName, st.type_training as typeTraining, st.is_active as isActive, st.major_id as majorId, m.name as majorName
                FROM students st LEFT JOIN majors m ON st.major_id = m.id LEFT JOIN student_terms stt ON st.id = stt.student_id
                WHERE stt.term_id = :termId
                ORDER BY st.created_at DESC
                LIMIT :limit OFFSET :offset`,
                {
                    replacements: { termId, limit: parseInt(limit), offset },
                    type: QueryTypes.SELECT,
                },
            );

            total = await StudentTerm.count({
                where: { term_id: termId },
            });
        }

        const totalPage = _.ceil(total / _.toInteger(limit));

        students = students.map((stu) => {
            return {
                ...stu,
                isActive: Boolean(stu.isActive),
            };
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách sinh viên thành công!',
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

exports.searchStudents = async (req, res) => {
    try {
        const { termId, keywords, searchField } = req.query;
        let students = [];

        const allowedFields = ['studentName', 'groupName'];

        if (!allowedFields.includes(searchField)) {
            return Error.sendWarning(res, 'Điều kiện tìm kiếm không hợp lệ!');
        }

        let searchQuery = '';

        if (searchField === 'studentName') {
            searchQuery = `AND st.full_name like :keywords`;
        } else {
            searchQuery = `AND gs.name like :keywords`;
        }

        students = await sequelize.query(
            `SELECT st.id as studentId, st.username, st.full_name as studentName, gs.id as groupId, gs.name as groupName
            FROM students st
            LEFT JOIN student_terms stt ON st.id = stt.student_id
            LEFT JOIN group_students gs ON stt.group_student_id = gs.id
            WHERE stt.term_id = :termId ${searchQuery}`,
            {
                replacements: { termId, keywords: `%${keywords}` },
                type: QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Tìm kiếm sinh viên thành công!',
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
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin sinh viên thành công!',
            student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.createStudent = async (req, res) => {
    try {
        let {
            username,
            fullName,
            gender,
            dateOfBirth,
            phone,
            email,
            typeTraining,
            clazzName,
            majorId,
            termId,
        } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const existedStudent = await Student.findOne({ where: { username } });
        if (existedStudent) {
            return Error.sendConflict(res, 'Mã sinh viên đã tồn tại!');
        }

        // 2000-10-19 => 19102000
        const password = await hashPassword(dateOfBirth.split('-').reverse().join(''));

        const student = await Student.create({
            username,
            fullName,
            password,
            gender,
            dateOfBirth,
            phone,
            email,
            typeTraining,
            clazzName,
            major_id: majorId,
        });

        await StudentTerm.create({
            student_id: student.id,
            term_id: termId,
        });

        const newStudent = await Student.findOne({
            where: { id: student.id },
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
            message: 'Tạo sinh viên thành công!',
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
        let {
            username,
            fullName,
            gender,
            phone,
            dateOfBirth,
            majorId,
            typeTraining,
            clazzName,
            email,
        } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Error.sendWarning(res, errors.array()[0].msg);
        }

        const student = await Student.findByPk(id);

        if (!student) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        const existedStudent = await Student.findOne({ where: { username } });

        if (existedStudent && existedStudent.id !== student.id) {
            return Error.sendConflict(res, 'Mã sinh viên không được phép trùng!');
        }

        await student.update({
            username,
            fullName,
            gender,
            phone,
            email,
            dateOfBirth,
            typeTraining,
            clazzName,
            major_id: majorId,
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

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật sinh viên thành công!',
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
            return Error.sendWarning(res, 'Hãy chọn file để import!');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        const students = [];
        // columns: STT, Mã SV, Họ đệm, Tên, Giới tính, Ngày sinh, Lớp học
        for (const student of jsonData) {
            if (
                !student['Mã SV'] ||
                !student['Họ đệm'] ||
                !student['Tên'] ||
                !student['Giới tính'] ||
                !student['Ngày sinh'] ||
                !student['Lớp học']
            ) {
                return Error.sendWarning(
                    res,
                    'File không đúng định dạng! Bạn hãy kiểm tra lại tên cột trong file excel.',
                );
            }

            const username = student['Mã SV'];
            const fullName = `${student['Họ đệm']} ${student['Tên']}`;
            const gender = student['Giới tính'] === 'Nam' ? 'MALE' : 'FEMALE';
            const dateOfBirth = student['Ngày sinh']; // 19/10/2000
            const clazzName = student['Lớp học'];
            const major_id = majorId;
            const password = await hashPassword(dateOfBirth.split('/').join('')); // 19102000

            students.push({
                username,
                password,
                fullName,
                gender,
                dateOfBirth: moment(dateOfBirth, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                clazzName,
                major_id,
            });
        }

        const studentTerms = await StudentTerm.findAll({
            where: { term_id: termId },
        });

        if (studentTerms.length !== 0) {
            for (const stu of students) {
                const student = await Student.findOne({
                    where: { username: stu.username },
                });

                if (!student) {
                    const newStudent = await Student.create(stu);
                    await StudentTerm.create({
                        student_id: newStudent.id,
                        term_id: termId,
                    });
                } else {
                    student.isActive = true;
                    await student.save();

                    const studentTerm = await StudentTerm.findOne({
                        where: { student_id: student.id, term_id: termId },
                    });

                    if (!studentTerm) {
                        await StudentTerm.create({
                            student_id: student.id,
                            term_id: termId,
                        });
                    }
                }
            }
        } else {
            for (const stu of students) {
                const student = await Student.findOne({
                    where: { username: stu.username },
                });

                if (!student) {
                    const newStudent = await Student.create(stu);

                    await StudentTerm.create({
                        student_id: newStudent.id,
                        term_id: termId,
                    });
                } else {
                    student.isActive = true;
                    await student.save();

                    await StudentTerm.create({
                        student_id: student.id,
                        term_id: termId,
                    });
                }
            }
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Nhập danh sách sinh viên thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.exportStudents = async (req, res) => {
    try {
        const { termId, majorId } = req.body;

        // check if termId and majorId are provided
        if (!termId || !majorId) {
            return Error.sendWarning(res, 'Hãy chọn học kỳ và ngành học!');
        }

        // check if termId and majorId are valid
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const major = await Major.findByPk(majorId);
        if (!major) {
            return Error.sendNotFound(res, 'Ngành học không tồn tại!');
        }

        // columns: STT, Mã SV, Họ và tên, Giới tính, Ngày sinh, Số điện thoại, Email, Lớp học
        const students = await sequelize.query(
            `SELECT st.username as 'Mã SV', st.full_name as 'Họ và tên', st.gender as 'Giới tính', st.date_of_birth as 'Ngày sinh', st.email as 'Email', st.clazz_name as 'Lớp học'
            FROM students st LEFT JOIN student_terms stt ON st.id = stt.student_id
            WHERE stt.term_id = :termId AND st.major_id = :majorId`,
            {
                replacements: {
                    termId,
                    majorId,
                },
                type: QueryTypes.SELECT,
            },
        );

        for (let i = 0; i < students.length; i++) {
            students[i]['STT'] = i + 1;
            students[i]['Giới tính'] = students[i]['Giới tính'] === 'MALE' ? 'Nam' : 'Nữ';
        }

        const ws = xlsx.utils.json_to_sheet(students);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Danh sách sinh viên');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-sinh-vien.xlsx');

        res.status(HTTP_STATUS.OK).send(buffer);
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
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        const studentTerms = await StudentTerm.findAll({
            where: { student_id: id },
        });

        for (let i = 0; i < studentTerms.length; i++) {
            await studentTerms[i].destroy();
        }

        await student.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xoá sinh viên thành công!',
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
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        await student.update({ password });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Làm mới mật khẩu sinh viên thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.lockAccount = async (req, res) => {
    try {
        const { id } = req.body;
        const student = await Student.findByPk(id);
        if (!student) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        await student.update({ isActive: false });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Khoá tài khoản sinh viên thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.lockAccounts = async (req, res) => {
    try {
        const { termId } = req.body;
        const studentTerms = await StudentTerm.findAll({
            where: { term_id: termId },
        });

        for (let i = 0; i < studentTerms.length; i++) {
            const student = await Student.findByPk(studentTerms[i].student_id);
            await student.update({ isActive: false });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Khoá danh sách tài khoản sinh viên thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.unlockAccount = async (req, res) => {
    try {
        const { id } = req.body;
        const student = await Student.findByPk(id);
        if (!student) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        await student.update({ isActive: true });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Mở khoá tài khoản sinh viên thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { termId, status } = req.body;
        const studentTerm = await StudentTerm.findOne({
            where: {
                term_id: termId,
                student_id: id,
            },
        });

        if (!studentTerm) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        await studentTerm.update({ status });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật trạng thái sinh viên thành công!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getStudentsNoHaveGroup = async (req, res) => {
    try {
        const { termId } = req.query;
        const query = `select st.id as studentId, st.full_name as fullName, st.username
        from students st join student_terms stTerm on stTerm.student_id = st.id 
        where stTerm.group_student_id is null and stTerm.term_id = :termId`;
        const students = await sequelize.query(query, {
            replacements: {
                termId,
            },
            type: QueryTypes.SELECT,
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách sinh viên chưa có nhóm thành công!',
            students,
        });
    } catch (error) {
        console.log('🚀 ~ exports.getStudentsNoHaveGroup= ~ error:', error);
        return Error.sendError(res, error);
    }
};

exports.countStudentsByTermId = async (req, res) => {
    try {
        const { termId } = req.query;
        const count = await StudentTerm.count({
            where: { term_id: termId },
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy số lượng sinh viên theo học kỳ thành công!',
            count,
        });
    } catch (error) {
        console.log('🚀 ~ exports.countStudentsByTermId= ~ error:', error);
        return Error.sendError(res, error);
    }
};

// ----------------- Student -----------------

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

        await Student.update({ password: newPassword }, { where: { id: req.user.id } });

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

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy thông tin sinh viên thành công!',
            user: student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { fullName, email, phone, gender, dateOfBirth } = req.body;

        await Student.update(
            { fullName, email, phone, gender, dateOfBirth },
            { where: { id: req.user.id } },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật thông tin sinh viên thành công!',
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

        const student = await Student.findOne({
            where: { username },
        });

        if (!student) {
            return Error.sendNotFound(res, 'Mã sinh viên không tồn tại!');
        }

        if (!student.email) {
            return Error.sendNotFound(
                res,
                'Tài khoản chưa cập nhật email! Bạn vui lòng liên hệ với giảng viên chủ quản để làm mới mật khẩu!',
            );
        }

        const generatePassword = Math.random().toString(36).slice(-8).toUpperCase();

        const newPassword = await hashPassword(generatePassword);

        student.password = newPassword;
        await student.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
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
