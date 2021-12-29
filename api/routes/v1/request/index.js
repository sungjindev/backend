const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.post('/', checkTokens, controller.request);
router.post('/accept', checkTokens, controller.accept);
router.post('/reject', checkTokens, controller.reject);
router.get('/getRequests', checkTokens, controller.getRequests);

module.exports = router;