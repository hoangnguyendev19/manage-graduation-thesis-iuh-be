const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getArticles,
    getArticleById,
    getArticleByGroupStudentId,
    createArticle,
    updateArticle,
    updateStatusArticle,
} = require('../controllers/article.controller');

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { protectStudent } = require('../middleware/student.middleware');

const router = express.Router();

router.put(
    APP_ROUTER.ARTICLE_BY_STATUS,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    updateStatusArticle,
);

router.put(APP_ROUTER.ID, protectStudent, updateArticle);

router.post(APP_ROUTER.INDEX, protectStudent, createArticle);

router.get(APP_ROUTER.ARTICLE_BY_GROUP_STUDENT, protectStudent, getArticleByGroupStudentId);

router.get(
    APP_ROUTER.ID,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    getArticleById,
);

router.get(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['HEAD_LECTURER', 'HEAD_COURSE']),
    getArticles,
);

module.exports = router;