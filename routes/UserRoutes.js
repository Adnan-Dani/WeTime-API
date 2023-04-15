const userController = require('./../controller/UserController');
const express = require('express');
const router = express.Router();

router.post('/register', userController.register);
router.post('/auth', userController.login);
router.post('/search', userController.searchUser);

module.exports = router;
