const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { verifyToken } = require('../../../../middlewares/verifyToken');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/', verifyToken, controller.test);

module.exports = router;