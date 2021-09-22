const jwt = require('jsonwebtoken');
const { ROOT_DIR, JWT_SECRET_KEY_FILE } = require('../env');
const { LOGIN_REQUIRED, TOKEN_EXPIRED, JSON_WEB_TOKEN_ERROR } = require('../errors');
const fs = require('fs');
const { join } = require('path');
const { verifyToken } = require('../utils/jwt');
const { RefreshToken, Trainer, Trainee } = require('../models');

const checkTokens = async(req,res,next) => {
  const JWT_SECRET_KEY = fs.readFileSync(join(ROOT_DIR, 'keys', JWT_SECRET_KEY_FILE));
  try {
    if(!req.headers.authorization)  next(LOGIN_REQUIRED);
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);  //accessToken은 authorization header를 통해 받고, JWT는 Bearer라는 인증 타입을 통해 넘겨받도록 표준화 되어있다.
    const refreshToken = verifyToken(req.cookies.refreshToken);

    if(accessToken == null) {
      if(refreshToken == null)  //accessToken, refreshToken 모두 만료된 경우, 다시 로그인 하도록 요구
        next(LOGIN_REQUIRED);
      else {  //accessToken은 만료되었지만 refreshToken은 유효한 경우
        const refresh = await RefreshToken.findOne({where: {refreshToken: req.cookies.refreshToken}});
        if(refresh.getTrainer()) { //Trainer의 refreshToken인 경우
          const trainer = await refresh.getTrainer();
          const newAccessToken = await jwt.sign({trainerPhoneNumber: trainer.trainerPhoneNumber}, JWT_SECRET_KEY, {algorithm: 'HS512', expiresIn: '1h'});
          res.cookie('accessToken', newAccessToken, {secure: true, httpOnly: true});
          req.cookies.accessToken = newAccessToken; //당장 다음 미들웨어에서 써야되기 때문에 처리해주는 듯 싶다.
          next();
        } 
        else {  //Trainee의 refreshToken인 경우
          const trainee = await refresh.getTrainee();
          const newAccessToken = await jwt.sign({traineePhoneNumber: trainee.traineePhoneNumber}, JWT_SECRET_KEY, {algorithm: 'HS512', expiresIn: '1h'});
          res.cookie('accessToken', newAccessToken, {secure: true, httpOnly: true});
          req.cookies.accessToken = newAccessToken; //당장 다음 미들웨어에서 써야되기 때문에 처리해주는 듯 싶다.
          next();
        }
      }
    } 
    else {
      if(refreshToken == null) {  //accessToken은 유효하지만, refreshToken은 만료된 경우
        const newRefreshToken = await jwt.sign({}, JWT_SECRET_KEY, {algorithm: 'HS512', expiresIn: '14d'});  //refreshToken은 DB에 저장
        if(accessToken.trainerPhoneNumber) {  //Trainer의 accessToken인 경우
          const trainer = await Trainer.findByPk(accessToken.trainerPhoneNumber);
          const refresh = await trainer.getRefreshToken();
          refresh.update({refreshToken: newRefreshToken});
          res.cookie('refreshToken', newRefreshToken);
          req.cookies.refreshToken = newRefreshToken; //당장 다음 미들웨어에서 써야되기 때문에 처리해주는 듯 싶다.
          next();
        }
        else {  //Trainee의 accessToken인 경우
          const trainee = await Trainee.findByPk(accessToken.traineePhoneNumber);
          const refresh = await trainee.getRefreshToken();
          refresh.update({refreshToken: newRefreshToken});
          res.cookie('refreshToken', newRefreshToken);
          req.cookies.refreshToken = newRefreshToken; //당장 다음 미들웨어에서 써야되기 때문에 처리해주는 듯 싶다.
          next();
        }
      }
      else //accessToken, refreshToken 모두 유효한 경우
        next();
    }
    
  } catch (error) {
    console.error(error);
    next(error);
  }
};


module.exports = { checkTokens };