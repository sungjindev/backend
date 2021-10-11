const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.post('/sms/message', controller.verifyCertification, controller.sendMessage);
router.post('/sms/compare', controller.compareAuthNumber);

module.exports = router;