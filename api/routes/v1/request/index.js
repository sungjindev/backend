const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.post('/', controller.request);
router.post('/accept', controller.accept);
router.post('/reject', controller.reject);

module.exports = router;