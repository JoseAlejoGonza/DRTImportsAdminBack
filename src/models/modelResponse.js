function responseStructure(statusCode, statusDetail, res){
    let response = {};
    let status = {};

    status={
        statusCode: statusCode,
        detail: statusDetail,
        message: ""
    }
    response.status = status;
    response.body = res;

    return response;
};

module.exports = {
    responseStructure
}