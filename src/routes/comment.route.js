const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getCommentByType,
    createComment,
    updateComment,
} = require('../controllers/comment.controller');

const { protectLecturer } = require('../middleware/lecturer.middleware');

const router = express.Router();

router.put(APP_ROUTER.ID, protectLecturer, updateComment);

router.post(APP_ROUTER.INDEX, protectLecturer, createComment);

router.get(APP_ROUTER.COMMENT_BY_TYPE, protectLecturer, getCommentByType);

module.exports = router;
