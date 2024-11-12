const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const { checkPlagiarism } = require('../controllers/check.controller');
const upload = require('../configs/uploadConfig');

const router = express.Router();

router.post(APP_ROUTER.INDEX, upload.single('file'), checkPlagiarism);

module.exports = router;
