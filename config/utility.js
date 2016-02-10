exports.randomString = function (stringLength) {
    // Генерация строки случйных символов
    stringLength = stringLength || 12;
    var chars = '0987654321QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm';
    var result = '';
    for (var i=0; i<stringLength;i++){
        var rnum = Math.floor(Math.random()*chars.length);
        result += chars.substring(rnum,rnum+1);
    }
    return result;
};
