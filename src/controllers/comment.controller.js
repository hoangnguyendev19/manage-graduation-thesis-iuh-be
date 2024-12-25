const { Comment, Term, LecturerTerm } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/mysql.config');
const logger = require('../configs/logger.config');

exports.getCommentByType = async (req, res) => {
    try {
        const { type, groupStudentId, termId } = req.query;

        // check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại');
        }

        const lecturerTerm = await LecturerTerm.findOne({
            where: {
                term_id: termId,
                lecturer_id: req.user.id,
            },
        });

        if (!lecturerTerm) {
            return Error.sendForbidden(res, 'Giảng viên không tồn tại trong học kỳ này');
        }

        const comment = await Comment.findOne({
            attributes: ['id', 'content'],
            where: {
                type,
                group_student_id: groupStudentId,
                lecturer_term_id: lecturerTerm.id,
            },
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bình luận thành công',
            comment,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.createComment = async (req, res) => {
    try {
        const { content, type, groupStudentId, termId } = req.body;

        // check if term exist
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại');
        }

        const lecturerTerm = await LecturerTerm.findOne({
            attributes: ['id'],
            where: {
                term_id: termId,
                lecturer_id: req.user.id,
            },
        });

        if (!lecturerTerm) {
            return Error.sendForbidden(res, 'Giảng viên không tồn tại trong học kỳ này');
        }

        let assigns = [];
        if (type !== 'ADVISOR') {
            assigns = await sequelize.query(
                `SELECT a.id    
            FROM assigns a
            INNER JOIN group_lecturers gl ON a.group_lecturer_id = gl.id
            INNER JOIN group_lecturer_members glm ON gl.id = glm.group_lecturer_id
            WHERE a.group_student_id = :groupStudentId AND glm.lecturer_term_id = :lecturerTermId`,
                {
                    replacements: {
                        groupStudentId,
                        lecturerTermId: lecturerTerm.id,
                    },
                    type: sequelize.QueryTypes.SELECT,
                },
            );
        } else {
            assigns = await sequelize.query(
                `SELECT gs.id    
            FROM group_students gs
            INNER JOIN topics t ON gs.topic_id = t.id
            WHERE gs.id = :groupStudentId AND t.lecturer_term_id = :lecturerTermId`,
                {
                    replacements: {
                        groupStudentId,
                        lecturerTermId: lecturerTerm.id,
                    },
                    type: sequelize.QueryTypes.SELECT,
                },
            );
        }

        if (assigns.length === 0) {
            return Error.sendForbidden(
                res,
                'Bạn không được phân công chấm điểm hoặc bình luận cho nhóm sinh viên này',
            );
        }

        const comment = await Comment.create({
            content,
            type,
            group_student_id: groupStudentId,
            term_id: termId,
            lecturer_term_id: lecturerTerm.id,
        });

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Tạo bình luận thành công',
            comment,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const comment = await Comment.findByPk(id);
        if (!comment) {
            return Error.sendNotFound(res, 'Bình luận không tồn tại');
        }

        const lecturerTerm = await LecturerTerm.findByPk(comment.lecturer_term_id);

        if (lecturerTerm.lecturer_id !== req.user.id) {
            return Error.sendForbidden(res, 'Bạn không có quyền chỉnh sửa bình luận');
        }

        await comment.update({ content });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật bình luận thành công',
            comment,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};
