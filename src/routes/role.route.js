const express = require('express');
const { APP_ROUTER } = require('../constants/router');
const {
    getRoles,
    getRolesByLecturerId,
    createRole,
    deleteRole,
} = require('../controllers/role.controller');

const router = express.Router();

router.get(APP_ROUTER.INDEX, getRoles);

router.get(APP_ROUTER.ROLE_BY_LECTURER, getRolesByLecturerId);

router.post(APP_ROUTER.INDEX, createRole);

router.delete(APP_ROUTER.ID, deleteRole);

module.exports = router;
