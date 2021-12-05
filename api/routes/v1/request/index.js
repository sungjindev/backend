const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.post('/', controller.request);
router.post('/accept', controller.accept);
router.post('/reject', controller.reject);
router.post('/getRequests', controller.getRequests);

module.exports = router;