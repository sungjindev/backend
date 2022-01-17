const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.post('/goal', checkTokens, controller.addGoal);

module.exports = router;