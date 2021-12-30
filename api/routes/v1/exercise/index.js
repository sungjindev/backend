const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.get('/', checkTokens, controller.getExercises);

module.exports = router;