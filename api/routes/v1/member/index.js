const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.post('/getMembers', controller.getMembers);
router.delete('/', controller.deleteMember);
router.put('/expired', controller.putExpired);

module.exports = router;