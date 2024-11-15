const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const { checkPlagiarism, checkAiContent } = require('../controllers/check.controller');
const upload = require('../configs/uploadConfig');

const router = express.Router();

router.post(APP_ROUTER.CHECK_PLAGIARISM, upload.single('file'), checkPlagiarism);
router.post(APP_ROUTER.CHECK_AI_CONTENT, upload.single('file'), checkAiContent);

module.exports = router;
