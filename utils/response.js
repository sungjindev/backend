exports.createResponse = (res, data, message='OK', status=200, success=true) => {
    res.status(stauts);
    return {
        success,
        status,
        message,
        data
    };
};