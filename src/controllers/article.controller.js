const { Article, Term, GroupStudent, StudentTerm } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/mysql.config');
const logger = require('../configs/logger.config');
const fs = require('fs');

exports.getArticles = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const articles = await sequelize.query(
            `SELECT a.id, a.name, a.author_number as authorNumber, a.status, a.link, a.bonus_score as bonusScore, s.username, s.full_name as fullName, gs.name as groupName
            FROM articles a
            INNER JOIN student_terms st ON a.student_term_id = st.id
            INNER JOIN students s ON st.student_id = s.id
            INNER JOIN group_students gs ON st.group_student_id = gs.id
            WHERE gs.term_id = :termId`,
            {
                replacements: { termId, lecturerId: req.user.id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách bài viết thành công!',
            articles,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getArticlesByLecturerId = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const articles = await sequelize.query(
            `SELECT a.id, a.name, a.author_number as authorNumber, a.status, a.link, a.bonus_score as bonusScore, s.username, s.full_name as fullName, gs.name as groupName
            FROM articles a
            INNER JOIN student_terms st ON a.student_term_id = st.id
            INNER JOIN students s ON st.student_id = s.id
            INNER JOIN group_students gs ON st.group_student_id = gs.id
            INNER JOIN topics t ON gs.topic_id = t.id
            INNER JOIN lecturer_terms lt ON t.lecturer_term_id = lt.id
            WHERE lt.term_id = :termId AND lt.lecturer_id = :lecturerId`,
            {
                replacements: { termId, lecturerId: req.user.id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách bài viết thành công!',
            articles,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await sequelize.query(
            `SELECT a.id, a.name, a.type, a.author, a.author_number as authorNumber, a.public_date as publicDate, a.status, a.link, a.bonus_score as bonusScore, a.comment, s.username, s.full_name as fullName, gs.name as groupName
            FROM articles a
            INNER JOIN student_terms st ON a.student_term_id = st.id
            INNER JOIN students s ON st.student_id = s.id
            INNER JOIN group_students gs ON st.group_student_id = gs.id
            WHERE a.id = :id`,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (article.length === 0) {
            return Error.sendNotFound(res, 'Bài viết không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bài viết thành công!',
            article: article[0],
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.getArticlesByStudentId = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const studentTerm = await StudentTerm.findOne({
            attributes: ['id'],
            where: { term_id: termId, student_id: req.user.id },
        });

        const articles = await Article.findAll({
            attributes: [
                'id',
                'name',
                'authorNumber',
                'publicDate',
                'status',
                'link',
                'bonusScore',
                'comment',
            ],
            where: { student_term_id: studentTerm.id },
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách bài viết khoa học thành công!',
            articles,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.createArticle = async (req, res) => {
    // Ensure the file is properly uploaded
    if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No file uploaded.',
        });
    }

    try {
        const { name, type, author, authorNumber, publicDate, termId } = req.body;

        const fileName = req.file.filename;
        const filePath = `/temp/${fileName}`; // Relative path to `public` folder

        // check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const studentTermId = await StudentTerm.findOne({
            attributes: ['id'],
            where: { term_id: termId, student_id: req.user.id },
        });

        if (!studentTermId) {
            return Error.sendNotFound(res, 'Sinh viên không tồn tại trong học kỳ!');
        }

        const articleExist = await Article.findOne({
            where: { student_term_id: studentTermId.id, name },
        });

        if (articleExist) {
            return Error.sendConflict(res, 'Bài viết đã tồn tại!');
        }

        const article = await Article.create({
            name,
            type,
            author,
            authorNumber,
            publicDate,
            link: filePath,
            student_term_id: studentTermId.id,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Tạo bài viết thành công!',
            article,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateArticle = async (req, res) => {
    // Ensure the file is properly uploaded
    if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No file uploaded.',
        });
    }

    try {
        const { id } = req.params;
        const { name, type, author, authorNumber, publicDate } = req.body;

        const article = await Article.findByPk(id);

        if (!article) {
            return Error.sendNotFound(res, 'Bài viết không tồn tại!');
        }

        if (article.status === 'APPROVED' || article.status === 'REJECTED') {
            return Error.sendForbidden(res, 'Không thể cập nhật bài viết đã được chấp nhận!');
        }

        // Delete the old file
        const oldFilePath = article.link; // format: '/temp/fileName'
        fs.unlinkSync(`public${oldFilePath}`); // Delete the file

        const fileName = req.file.filename;
        const filePath = `/temp/${fileName}`; // Relative path to `public` folder

        await article.update({
            name,
            type,
            author,
            authorNumber,
            publicDate,
            link: filePath,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật bài viết thành công!',
            article,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findByPk(id);

        if (!article) {
            return Error.sendNotFound(res, 'Bài viết không tồn tại!');
        }

        if (article.status === 'APPROVED' || article.status === 'REJECTED') {
            return Error.sendForbidden(res, 'Không thể xóa bài viết đã được chấp nhận!');
        }

        // Delete the file
        const filePath = article.link; // format: '/temp/fileName'
        fs.unlinkSync(`public${filePath}`); // Delete the file

        await article.destroy();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Xóa bài viết thành công!',
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};

exports.updateStatusArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment, bonusScore } = req.body;

        const article = await Article.findByPk(id);

        if (!article) {
            return Error.sendNotFound(res, 'Bài viết không tồn tại!');
        }

        if (status === 'REJECTED' && bonusScore !== 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Điểm thưởng phải bằng 0 khi từ chối bài viết!',
            });
        }

        if (status === 'APPROVED' && bonusScore === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Điểm thưởng phải lớn hơn 0 khi chấp nhận bài viết!',
            });
        }

        await article.update({ status, comment, bonusScore });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật trạng thái bài viết thành công!',
            article,
        });
    } catch (error) {
        logger.error(error);
        Error.sendError(res, error);
    }
};
