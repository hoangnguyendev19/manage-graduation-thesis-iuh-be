const { Article, Term, GroupStudent } = require('../models/index');
const Error = require('../helper/errors');
const { HTTP_STATUS } = require('../constants/constant');
const { sequelize } = require('../configs/connectDB');

exports.getArticles = async (req, res) => {
    try {
        const { termId } = req.query;

        // check if termId exists
        const term = await Term.findByPk(termId);
        if (!term) {
            return Error.sendNotFound(res, 'Học kỳ không tồn tại!');
        }

        const articles = await sequelize.query(
            `SELECT a.id, a.name, a.type, a.author, a.author_number as authorNumber, a.public_date as publicDate, a.status, a.link, a.bonus_score as bonusScore, gs.name as groupName
            FROM articles a
            INNER JOIN group_students gs ON a.group_student_id = gs.id
            WHERE gs.term_id = :termId`,
            {
                replacements: { termId },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy danh sách bài viết thành công!',
            articles,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findByPk(id);

        if (!article) {
            return Error.sendNotFound(res, 'Bài viết không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bài viết thành công!',
            article,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.getArticleByGroupStudentId = async (req, res) => {
    try {
        const { id } = req.params;

        // check if groupStudentId exists
        const groupStudent = await GroupStudent.findByPk(id);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        const article = await Article.findOne({
            where: { group_student_id: id },
        });

        if (!article) {
            return Error.sendNotFound(res, 'Bài viết không tồn tại!');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Lấy bài viết thành công!',
            article,
        });
    } catch (error) {
        console.log(error);
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
        const { name, type, author, authorNumber, publicDate, groupStudentId } = req.body;

        // check if groupStudentId exists
        const groupStudent = await GroupStudent.findByPk(groupStudentId);
        if (!groupStudent) {
            return Error.sendNotFound(res, 'Nhóm sinh viên không tồn tại!');
        }

        // check if article exists
        const articleExists = await Article.findOne({
            where: { group_student_id: groupStudentId },
        });

        if (articleExists) {
            return Error.sendConflict(res, 'Bài viết đã tồn tại!');
        }

        const fileName = req.file.filename;
        const filePath = `/uploads/${fileName}`; // Relative path to `public` folder

        const article = await Article.create({
            name,
            type,
            author,
            authorNumber,
            publicDate,
            link: filePath,
            group_student_id: groupStudentId,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Tạo bài viết thành công!',
            article,
        });
    } catch (error) {
        console.log(error);
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

        const fileName = req.file.filename;
        const filePath = `/uploads/${fileName}`; // Relative path to `public` folder

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
        console.log(error);
        Error.sendError(res, error);
    }
};

exports.updateStatusArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        const article = await Article.findByPk(id);

        if (!article) {
            return Error.sendNotFound(res, 'Bài viết không tồn tại!');
        }

        await article.update({ status, comment, bonusScore: status === 'APPROVED' ? 2 : 0 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cập nhật trạng thái bài viết thành công!',
            article,
        });
    } catch (error) {
        console.log(error);
        Error.sendError(res, error);
    }
};
