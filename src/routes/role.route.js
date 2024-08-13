const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getRoles,
    getRolesByLecturerId,
    createRole,
    deleteRole,
} = require('../controllers/role.controller');

const router = express.Router();

const { protectLecturer, checkRole } = require('../middleware/lecturer.middleware');
const { validateRole } = require('../middleware/validation.middleware');

router.get(APP_ROUTER.ROLE_BY_LECTURER, getRolesByLecturerId);

router.delete(APP_ROUTER.ID, protectLecturer, checkRole(['ADMIN', 'HEAD_LECTURER']), deleteRole);

router.get(APP_ROUTER.INDEX, getRoles);

router.post(
    APP_ROUTER.INDEX,
    protectLecturer,
    checkRole(['ADMIN', 'HEAD_LECTURER']),
    validateRole,
    createRole,
);

module.exports = router;
