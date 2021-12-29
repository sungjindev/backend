const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.get('/sms/message', checkTokens, controller.verifyCertification, controller.sendMessage);
router.post('/sms/compare', checkTokens, controller.compareAuthNumber);

module.exports = router;