var crypto = require('crypto');

exports.encode = function(payload, secret){
    var algorithm ='HS256';
    var header = {typ:'JWT', alg:algorithm};
    var jwt = base64Encode(JSON.stringify(header))+'.'+base64Encode(JSON.stringify(payload));
    return jwt + '.' + sighn(jwt,secret);
};
function base64Encode(str){
    return new Buffer(str).toString('base64');
}
function sighn(str,key){
    return crypto.createHmac('sha256',key).update(str).digest('base64');
}