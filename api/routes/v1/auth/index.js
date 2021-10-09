const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.get('/sms/message/:phone', controller.verifyCertification, controller.sendMessage);

module.exports = router;