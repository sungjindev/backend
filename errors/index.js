const httpErrors = require('http-errors');

const createError = err => {
    const e = httpErrors(err[0], err[1]);
    e.code = err[2];
    return e;  
};

const errors = {  
    // 400 Errors
    INVALID_TRAINER_PHONE: [400, '유효하지 않은 트레이너 휴대폰 번호입니다.'],
    INVALID_TRAINEE_PHONE: [400, '유효하지 않은 트레이니 휴대폰 번호입니다.'],
    INVALID_TRAINER_PASSWORD: [400, '유효하지 않은 트레이너 비밀번호입니다.'],
    INVALID_TRAINEE_PASSWORD: [400, '유효하지 않은 트레이니 비밀번호입니다.'],
    TOKEN_EXPIRED : [400, '만료된 Token입니다.'],
    ALREADY_LOGGED_OUT : [400, '이미 로그아웃된 사용자입니다.'],
  
    // 401 Errors
    LOGIN_REQUIRED: [401, '로그인이 필요합니다.'],
  
    // 403 Errors
    JSON_WEB_TOKEN_ERROR : [403, '권한이 없는 요청입니다.'],
  
    // 404 Errors
    TRAINER_NOT_FOUND: [404, '찾을 수 없는 트레이너입니다.'],
    TRAINEE_NOT_FOUND: [404, '찾을 수 없는 트레이니입니다.'],
    TRAINER_DUPLICATED: [404, '중복된 트레이너 Id입니다.'],
    TRAINEE_DUPLICATED: [404, '중복된 트레이니 Id입니다.'],
    SAME_PASSWORD: [404, '기존과 동일한 패스워드입니다.'],
    NOT_FOUND: [404, '찾을 수 없는 요청입니다.'],
    EXCEEDED_SMS_ATTEMPTS : [404, '하루 전송 건 수를 초과했습니다.'],
    EXCEEDED_AUTH_ATTEMPTS : [404, '하루 인증 시도 횟수를 초과했습니다.'],
    INVALID_CERTIFICATION_KEY : [404, '유효하지 않은 인증키입니다.'],
    CERTIFICATION_KEY_EXPIRED : [404, '유효 시간이 지났습니다.'],
    CERTIFICATION_INFO_NOT_EXISTED : [404, '해당 정보가 존재하지 않습니다.'],
    
    // 500 Errors
    SERVER_ERROR: [500, '서버 에러.'],
};

Object.keys(errors).forEach(key => {
    errors[key] = createError([...errors[key], key]);
});

module.exports = errors;
