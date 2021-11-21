const { createResponse } = require('../../../../utils/response');
const { Request, Trainer, Trainee } = require('../../../../models');
const { INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE, DUPLICATED_REQUEST } = require('../../../../errors');

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
      const trainee = await Trainee.findByPk(requestor);
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
    }
    
    const duplicated1 = await Request.findOne({where: {requestor, requestee}});
    const duplicated2 = await Request.findOne({where: {requestor: requestee, requestee: requestor}});
    if(duplicated1 || duplicated2)
      return next(DUPLICATED_REQUEST);

    const request = await Request.create(req.body);
    return res.json(createResponse(res, request));
  } catch (error) {
    console.error(error);
    next(error);
  }
};


module.exports = { request };