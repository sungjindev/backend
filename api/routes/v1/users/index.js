const { Router } = require('express');
const router = Router();
const controller = require('./controller');
const { checkTokens } = require('../../../../middlewares/auth');

router.post('/goal', checkTokens, controller.addGoal);
router.post('/uploadImage', checkTokens, controller.upload.single('img'), controller.uploadImage);
router.post('/uploadInbody', checkTokens, controller.upload.single('img'), controller.uploadInbody);
router.get('/getImage', checkTokens, controller.getImage);

module.exports = router;