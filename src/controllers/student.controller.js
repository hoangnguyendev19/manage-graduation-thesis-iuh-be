const { Student, Major, StudentTerm } = require('../models/index');
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

// ----------------- Auth -----------------
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const student = await Student.findOne({
            where: { username },
        });

        if (!student) {
            return Error.sendNotFound(res, 'Email hoặc mật khẩu không chính xác!');
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
            message: 'Refresh Token success!',
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
            message: 'Logout success!',
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
            keywords: `%${keywords}%`,
            limit: _.toInteger(limit),
            offset: offset,
        };

        let searchQuery = searchField ? `AND st.${searchField} like :keywords` : '';

        let initQUery = `SELECT st.id, st.username, st.full_name as fullName, st.phone, st.email, st.gender, st.clazz_name as clazzName, st.type_training as typeTraining, st.is_active as isActive, st.major_id as majorId, m.name as majorName
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
            message: 'Get all students success!',
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
                `SELECT st.id, st.username, st.full_name as fullName, st.phone, st.email, st.gender, st.clazz_name as clazzName, st.type_training as typeTraining, st.is_active as isActive, st.major_id as majorId, m.name as majorName
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
                `SELECT st.id, st.username, st.full_name as fullName, st.phone, st.email, st.gender, st.clazz_name as clazzName, st.type_training as typeTraining, st.is_active as isActive, st.major_id as majorId, m.name as majorName
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
            message: 'Get all students success!',
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
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get student by id success!',
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

        const password = await hashPassword('12345678');

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
            message: 'Create student success!',
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
        let { fullName, gender, phone, dateOfBirth, majorId, typeTraining, clazzName, email } =
            req.body;
        const student = await Student.findByPk(id);
        if (!student) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        await student.update({
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
            message: 'Update student success!',
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
            return Error.sendWarning(res, 'Hãy chọn file để import!');
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        const students = [];
        const password = await hashPassword('12345678');
        // columns: STT, Mã SV, Họ đệm, Tên, Giới tính, Ngày sinh, Số điện thoại, Mã lớp
        for (const student of jsonData) {
            const username = student['Mã SV'];
            const fullName = `${student['Họ đệm']} ${student['Tên']}`;
            const gender = student['Giới tính'] === 'Nam' ? 'MALE' : 'FEMALE';
            const phone = student['Số điện thoại'];
            const clazzName = student['Mã lớp'];
            const major_id = majorId;

            students.push({
                username,
                password,
                fullName,
                gender,
                phone,
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
            message: 'Import students success!',
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
            return Error.sendNotFound(res, 'Sinh viên không tồn tại!');
        }

        await student.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Delete student success!',
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
            message: 'Reset password student success!',
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
            message: 'Lock account student success!',
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
            message: 'Lock accounts student success!',
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
            message: 'Unlock account student success!',
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
            message: 'Update status student success!',
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
            message: 'Get success',
            students,
        });
    } catch (error) {
        console.log('🚀 ~ exports.getStudentsNoHaveGroup= ~ error:', error);
        Error.sendError(res, error);
    }
};

// ----------------- Student -----------------

exports.updatePassword = async (req, res) => {
    try {
        let { password, newPassword } = req.body;

        const flag = await comparePassword(password, req.user.password);
        if (!flag) {
            return Error.sendWarning(res, 'Mật khẩu không chính xác!');
        }

        newPassword = await hashPassword(newPassword);

        await Student.update({ password: newPassword }, { where: { id: req.user.id } });

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

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Get me success!',
            user: student,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, gender } = req.body;

        await Student.update(
            { fullName, email, phoneNumber, gender },
            { where: { id: req.user.id } },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Update me success!',
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
