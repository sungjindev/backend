const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.post('/', checkTokens, controller.addRecords);
router.post('/getRecords', checkTokens, controller.getRecords);

module.exports = router;