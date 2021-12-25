const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.post('/sms/message', checkTokens, controller.verifyCertification, controller.sendMessage);
router.post('/sms/compare', checkTokens, controller.compareAuthNumber);

module.exports = router;