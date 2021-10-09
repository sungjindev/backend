const crypto = require('crypto');
const {SMS_SERVICE_ID, SMS_ACCESS_KEY, SMS_SECRET_KEY, PIPI_PHONE} = require('../../env');

const makeSignature = () => {
  const date = Date.now().toString();
  const url = `/sms/v2/services/${SMS_SERVICE_ID}/messages`;
  const  hmac = crypto.createHmac('sha256', SMS_SECRET_KEY);
  let data = new Array;
  data.push("POST");
  data.push(" ");
  data.push(url);
  data.push("\n");
  data.push(date);
  data.push("\n");
  data.push(SMS_ACCESS_KEY);
  const signature = hmac.update(data.join('')).digest('base64');
  return signature;
};

const makeMessage = (phone, authNumber) => {
  const signature = makeSignature();
  const date = Date.now().toString;
  const form = {
    url: `https://sens.apigw.ntruss.com/sms/v2/services/${SMS_SERVICE_ID}/messages`,
    headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'x-ncp-iam-access-key': `${SMS_ACCESS_KEY}`,
			'x-ncp-apigw-timestamp': date,
			'x-ncp-apigw-signature-v2': signature
    },
    data: {
			'type' : 'SMS',
			'countryCode' : '82',
			'from' : `${PIPI_PHONE.toString()}`,
			'content' : `[피티피플] 인증번호 ${authNumber.toString()} 입니다.`,
			'messages' : [
				{
					'to' : `${phone}`
				}
			]
    }
  }
  return form;
};

module.exports = {makeSignature, makeMessage};