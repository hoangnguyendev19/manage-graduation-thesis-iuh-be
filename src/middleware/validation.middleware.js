const { check } = require('express-validator');

exports.validateLogin = [
    check('username')
        .notEmpty()
        .withMessage('Username không được để trống!')
        .isLength(8)
        .withMessage('Username phải có 8 ký tự!'),

    check('password').notEmpty().withMessage('Password không được để trống!'),
];

exports.validateUpdatePassword = [
    check('password').notEmpty().withMessage('Mật khẩu cũ không được để trống!'),

    check('newPassword')
        .notEmpty()
        .withMessage('Mật khẩu mới không được để trống!')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự!'),
];

exports.validateForgotPassword = [
    check('username')
        .notEmpty()
        .withMessage('Username không được để trống!')
        .isLength(8)
        .withMessage('Username phải có 8 ký tự!'),
];

exports.validateStudent = [
    check('username')
        .notEmpty()
        .withMessage('Username không được để trống!')
        .isLength(8)
        .withMessage('Username phải có 8 ký tự!'),

    check('fullName')
        .notEmpty()
        .withMessage('Họ và tên không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tên phải có ít nhất 5 ký tự!'),

    check('dateOfBirth')
        .notEmpty()
        .withMessage('Ngày sinh không được để trống!')
        .isDate({
            format: 'YYYY-MM-DD',
        })
        .withMessage('Ngày sinh không hợp lệ!'),

    check('clazzName')
        .notEmpty()
        .withMessage('Lớp danh nghĩa không được để trống!')
        .withMessage('Lớp danh nghĩa không hợp lệ!'),

    check('gender')
        .notEmpty()
        .withMessage('Giới tính không được để trống!')
        .isIn(['MALE', 'FEMALE'])
        .withMessage('Giới tính không hợp lệ!'),
];

exports.validateLecturer = [
    check('username')
        .notEmpty()
        .withMessage('Username không được để trống!')
        .isLength(8)
        .withMessage('Username phải có 8 ký tự!'),

    check('fullName')
        .notEmpty()
        .withMessage('Họ và tên không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tên phải có ít nhất 5 ký tự!'),

    check('gender')
        .notEmpty()
        .withMessage('Giới tính không được để trống!')
        .isIn(['MALE', 'FEMALE'])
        .withMessage('Giới tính không hợp lệ!'),
];

exports.validateLecturerTerm = [
    check('lecturerId')
        .notEmpty()
        .withMessage('ID giảng viên không được để trống!')
        .isUUID()
        .withMessage('ID giảng viên không hợp lệ!'),

    check('termId')
        .notEmpty()
        .withMessage('ID học kỳ không được để trống!')
        .isUUID()
        .withMessage('ID học kỳ không hợp lệ!'),
];

exports.validateMajor = [
    check('name')
        .notEmpty()
        .withMessage('Tên ngành không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tên ngành phải có ít nhất 5 ký tự!'),
];

exports.validateTerm = [
    check('name')
        .notEmpty()
        .withMessage('Tên học kỳ không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tên học kỳ phải có ít nhất 5 ký tự!'),

    check('startDate')
        .notEmpty()
        .withMessage('Ngày bắt đầu không được để trống!')
        .isDate({
            format: 'YYYY-MM-DD HH:mm:ss',
        })
        .withMessage('Ngày bắt đầu không hợp lệ!'),

    check('endDate')
        .notEmpty()
        .withMessage('Ngày kết thúc không được để trống!')
        .isDate({
            format: 'YYYY-MM-DD HH:mm:ss',
        })
        .withMessage('Ngày kết thúc không hợp lệ!'),
];

exports.validateTermDetail = [
    check('startDate')
        .notEmpty()
        .withMessage('Ngày bắt đầu không được để trống!')
        .isDate({
            format: 'YYYY-MM-DD HH:mm:ss',
        })
        .withMessage('Ngày bắt đầu không hợp lệ!'),

    check('endDate')
        .notEmpty()
        .withMessage('Ngày kết thúc không được để trống!')
        .isDate({
            format: 'YYYY-MM-DD HH:mm:ss',
        })
        .withMessage('Ngày kết thúc không hợp lệ!'),
];

exports.validateTopic = [
    check('name')
        .notEmpty()
        .withMessage('Tên đề tài không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tên đề tài phải có ít nhất 5 ký tự!'),

    check('description')
        .notEmpty()
        .withMessage('Mô tả không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Mô tả phải có ít nhất 10 ký tự!'),

    check('quantityGroupMax')
        .notEmpty()
        .withMessage('Số lượng nhóm tối đa không được để trống!')
        .isInt()
        .withMessage('Số lượng nhóm tối đa phải là số!'),

    check('standardOutput')
        .notEmpty()
        .withMessage('Chuẩn đầu ra không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Chuẩn đầu phải có ít nhất 10 ký tự!'),

    check('requireInput')
        .notEmpty()
        .withMessage('Yêu cầu đầu vào không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Yêu cầu đầu vào phải có ít nhất 10 ký tự!'),

    check('target')
        .notEmpty()
        .withMessage('Mục tiêu không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Mục tiêu phải có ít nhất 10 ký tự!'),

    check('expectedResult')
        .notEmpty()
        .withMessage('Kết quả dự kiến không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Kết quả dự kiến phải có ít nhất 10 ký tự!'),
];

exports.validateGroupStudent = [
    check('termId')
        .notEmpty()
        .withMessage('ID học kỳ không được để trống!')
        .isUUID()
        .withMessage('ID học kỳ không hợp lệ!'),

    check('studentIds')
        .notEmpty()
        .withMessage('Danh sách ID sinh viên không được để trống!')
        .isArray()
        .withMessage('Danh sách ID sinh viên phải là mảng!'),
];

exports.validateGroupLecturer = [
    check('termId')
        .notEmpty()
        .withMessage('ID học kỳ không được để trống!')
        .isUUID()
        .withMessage('ID học kỳ không hợp lệ!'),

    check('lecturers')
        .notEmpty()
        .withMessage('Danh sách ID giảng viên không được để trống!')
        .isArray({
            min: 2,
            max: 3,
        })
        .withMessage('Danh sách ID giảng viên phải là mảng!'),
];

exports.validateEvaluation = [
    check('type')
        .notEmpty()
        .withMessage('Loại đánh giá không được để trống!')
        .isIn(['ADVISOR', 'REVIEWER', 'REPORT'])
        .withMessage('Loại đánh giá không hợp lệ!'),

    check('termId')
        .notEmpty()
        .withMessage('ID học kỳ không được để trống!')
        .isUUID()
        .withMessage('ID học kỳ không hợp lệ!'),

    check('name')
        .notEmpty()
        .withMessage('Tên đánh giá không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tên đánh giá phải có ít nhất 5 ký tự!'),

    check('scoreMax')
        .notEmpty()
        .withMessage('Điểm tối đa không được để trống!')
        .isInt()
        .withMessage('Điểm tối đa phải là số!'),

    check('description')
        .notEmpty()
        .withMessage('Mô tả không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Mô tả phải có ít nhất 10 ký tự!'),
];

exports.validateNotificationStudent = [
    check('title')
        .notEmpty()
        .withMessage('Tiêu đề thông báo không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tiêu đề thông báo phải có ít nhất 5 ký tự!'),

    check('content')
        .notEmpty()
        .withMessage('Nội dung thông báo không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Nội dung thông báo phải có ít nhất 10 ký tự!'),

    check('studentIds')
        .notEmpty()
        .withMessage('Danh sách ID sinh viên không được để trống!')
        .isArray()
        .withMessage('Danh sách ID sinh viên phải là mảng!'),
];

exports.validateNotificationGroupStudent = [
    check('title')
        .notEmpty()
        .withMessage('Tiêu đề thông báo không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tiêu đề thông báo phải có ít nhất 5 ký tự!'),

    check('content')
        .notEmpty()
        .withMessage('Nội dung thông báo không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Nội dung thông báo phải có ít nhất 10 ký tự!'),

    check('groupStudentIds')
        .notEmpty()
        .withMessage('Danh sách ID nhóm sinh viên không được để trống!')
        .isArray()
        .withMessage('Danh sách ID nhóm sinh viên phải là mảng!'),
];

exports.validateNotificationLecturer = [
    check('title')
        .notEmpty()
        .withMessage('Tiêu đề thông báo không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tiêu đề thông báo phải có ít nhất 5 ký tự!'),

    check('content')
        .notEmpty()
        .withMessage('Nội dung thông báo không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Nội dung thông báo phải có ít nhất 10 ký tự!'),

    check('lecturerIds')
        .notEmpty()
        .withMessage('Danh sách ID giảng viên không được để trống!')
        .isArray()
        .withMessage('Danh sách ID giảng viên phải là mảng!'),
];

exports.validateNotificationGroupLecturer = [
    check('title')
        .notEmpty()
        .withMessage('Tiêu đề thông báo không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tiêu đề thông báo phải có ít nhất 5 ký tự!'),

    check('content')
        .notEmpty()
        .withMessage('Nội dung thông báo không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Nội dung thông báo phải có ít nhất 10 ký tự!'),

    check('groupLecturerIds')
        .notEmpty()
        .withMessage('Danh sách ID nhóm giảng viên không được để trống!')
        .isArray()
        .withMessage('Danh sách ID nhóm giảng viên phải là mảng!'),
];

exports.validateNotification = [
    check('title')
        .notEmpty()
        .withMessage('Tiêu đề thông báo không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tiêu đề thông báo phải có ít nhất 5 ký tự!'),

    check('content')
        .notEmpty()
        .withMessage('Nội dung thông báo không được để trống!')
        .isLength({ min: 10 })
        .withMessage('Nội dung thông báo phải có ít nhất 10 ký tự!'),

    check('termId')
        .notEmpty()
        .withMessage('ID học kỳ không được để trống!')
        .isUUID()
        .withMessage('ID học kỳ không hợp lệ!'),
];

exports.validateRole = [
    check('name')
        .notEmpty()
        .withMessage('Tên quyền không được để trống!')
        .isLength({ min: 5 })
        .withMessage('Tên quyền phải có ít nhất 5 ký tự!'),

    check('lecturerId')
        .notEmpty()
        .withMessage('ID giảng viên không được để trống!')
        .isUUID()
        .withMessage('ID giảng viên không hợp lệ!'),
];
