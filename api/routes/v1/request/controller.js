const { createResponse } = require('../../../../utils/response');
const { Request, Trainer, Trainee } = require('../../../../models');
const { INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE } = require('../../../../errors');

const request = async(req,res,next) => {
  const {body: {requestor, requestee, requestorIsTrainer}} = req;
  try {
    if(requestorIsTrainer) {
      const trainer = await Trainer.findByPk(requestor);
      const trainee = await Trainee.findByPk(requestee);
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
    } else {
      const trainer = await Trainer.findByPk(requestee);
      const trainee = await Trainer.findByPk(requestor);
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
    }
    const request = await Request.create(req.body);
    return res.json(createResponse(res, request));
  } catch (error) {
    console.error(error);
    next(error);
  }
};


module.exports = { request };