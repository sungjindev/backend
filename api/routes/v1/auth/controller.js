const { createResponse } = require('../../../../utils/response');
const { Certification } = require('../../../../models');
const { makeAuthNumber, makeMessage } = require('../../../../utils/sms');
const { EXCEEDED_AUTH_ATTEMPTS, EXCEEDED_SMS_ATTEMPTS } = require('../../../../errors');
const { default: axios } = require('axios');

const verifyCertification = async(req,res,next) => {
  let {params: {phone}} = req;
  try {
    const authNumber = makeAuthNumber();
    res.locals.authNumber = authNumber;
    const date = new Date();
    let certification;
    if(phone[0]=='0') { //트레이너는 '0'+'phone', 트레이니는 '1'+'phone'으로 구분한다. 
      phone = phone.slice(1);
      certification = await Certification.findOrCreate({where: {trainerPhoneNumber: phone}, defaults: {trainerPhoneNumber: phone, lastRequest: date, authNumber}});
    } else if(phone[0]=='1') {
      phone = phone.slice(1);
      certification = await Certification.findOrCreate({where: {traineePhoneNumber: phone}, defaults: {traineePhoneNumber: phone, lastRequest: date, authNumber}});
    }
    res.locals.phone = phone;
    if(!certification[1]) { //기존에 certification이 존재했다면
      const elapsedTime = (date.getTime()-certification[0].lastRequest.getTime()) / 1000; //경과시간을 초단위로 표현한 것
      await certification[0].update({authNumber, lastRequest: date});
      if(elapsedTime < 86400 && certification[0].smsAttempts >= 5)
        return next(EXCEEDED_SMS_ATTEMPTS);
      if(elapsedTime >= 86400) {  //하루가 지났다면
        await certification[0].update({authNumber, smsAttempts: 1, authAttempts: 0, lastRequest: date});
      }
      else {  //하루가 지나지 않았지만 sms 시도 횟수는 5회 미만이라면,
        await certification[0].increment('smsAttempts', {by: 1});
      }
    }
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const sendMessage = async(req,res,next) => {
  try {
    const phone = res.locals.phone.toString();
    const authNumber = res.locals.authNumber;
    const form = makeMessage(phone, authNumber);
    await axios({
      method: "POST",
      json: true,
      url: form.url.toString(),
      headers: form.headers,
      data: form.data
    });
    res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { verifyCertification, sendMessage };