const { Trainee } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINEE_ID, INVALID_TRAINEE_PASSWORD } = require('../../../../errors');

const register = async(req,res,next) => {
  try {
    const trainee = await Trainee.create(req.body);
    return res.json(createResponse(res, trainee));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const login = async(req,res,next) => {
  const { traineeId, traineePassword } = req.body;
  try {
    const trainee = await Trainee.findByPk(traineeId);
    if(!trainee) return next(INVALID_TRAINEE_ID);
    if(trainee.traineePassword != traineePassword)
      return next(INVALID_TRAINEE_PASSWORD);
    return res.json(createResponse(res, trainee));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login };