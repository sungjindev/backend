const jwt = require('jsonwebtoken');
const { COOKIE_NAME } = require('../env');
const { TOKEN_EXPIRED, JSON_WEB_TOKEN_ERROR } = require('../errors');
const fs = require('fs');
const { join } = require('path');
const privateKey = fs.readFileSync(join(__dirname,'../keys/private.key'));

const verifyToken = async(req,res,next) => {
  const token = req.cookies[COOKIE_NAME];
  try {
    await jwt.verify(token, privateKey);
    next();
  } catch (error) {
    if(error.name == "TokenExpiredError") return next(TOKEN_EXPIRED);
    if(error.name == "JsonWebTokenError") return next(JSON_WEB_TOKEN_ERROR);
    next(error);
  }
};

module.exports = { verifyToken };