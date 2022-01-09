const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.post('/', checkTokens, controller.addRecord);
router.post('/', checkTokens, controller.deleteRecord);
router.post('/', checkTokens, controller.getRecord);

module.exports = router;