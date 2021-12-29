const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.get('/getMembers', checkTokens, controller.getMembers);
router.post('/deleteMember', checkTokens, controller.deleteMember);
router.put('/expired', checkTokens, controller.putExpired);

module.exports = router;