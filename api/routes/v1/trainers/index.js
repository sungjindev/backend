const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/logout', checkTokens, controller.logout);
router.patch('/resetPassword', checkTokens, controller.resetPassword);
router.get('/', checkTokens, controller.getTrainer);

module.exports = router;