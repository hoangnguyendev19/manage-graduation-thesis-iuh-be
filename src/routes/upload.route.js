const express = require('express');
const uploadCloud = require('../configs/cloudinary');
const { APP_ROUTER } = require('../constants/router');
const { uploadImage } = require('../controllers/upload.controller');
const router = express.Router();

router.post(APP_ROUTER.INDEX, uploadCloud.single('image'), uploadImage);

module.exports = router;
