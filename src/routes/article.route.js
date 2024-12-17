const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getArticles,
    getArticleById,
    getArticlesByLecturerId,
    getArticlesByStudentId,
    createArticle,
    updateArticle,
    updateStatusArticle,
} = require('../controllers/article.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');

const upload = require('../configs/uploadTemp.config');

const router = express.Router();

router.put(APP_ROUTER.ARTICLE_BY_STATUS, protectLecturer, updateStatusArticle);

router.put(APP_ROUTER.ID, protectStudent, upload.single('file'), updateArticle);

router.post(APP_ROUTER.INDEX, protectStudent, upload.single('file'), createArticle);

router.get(APP_ROUTER.ARTICLE_BY_STUDENT, protectStudent, getArticlesByStudentId);

router.get(APP_ROUTER.ARTICLE_BY_LECTURER, protectLecturer, getArticlesByLecturerId);

router.get(APP_ROUTER.ID, getArticleById);

router.get(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE']),
    getArticles,
);

module.exports = router;
