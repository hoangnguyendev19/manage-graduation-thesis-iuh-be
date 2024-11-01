const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const { suggestTopics } = require('../controllers/suggest.controller');

const { protectStudent } = require('../middleware/student.middleware');

const router = express.Router();

router.post(APP_ROUTER.INDEX, protectStudent, suggestTopics);

module.exports = router;
