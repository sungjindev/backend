const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.get('/sms/message/:phone', controller.verifyCertification, controller.sendMessage);
router.get('/sms/compare/:phone', controller.compareAuthNumber);

module.exports = router;