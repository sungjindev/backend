const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.post('/goal', checkTokens, controller.addGoal);
router.post('/upload/profileImage', checkTokens, controller.uploadProfile.single('img'), controller.uploadProfileImage);
router.post('/upload/inbodyImage', checkTokens, controller.uploadInbody.single('img'), controller.uploadInbodyImage);
router.get('/getImage', checkTokens, controller.getImage);

module.exports = router;