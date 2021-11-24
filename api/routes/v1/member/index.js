const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.get('/', controller.getMembers);


module.exports = router;