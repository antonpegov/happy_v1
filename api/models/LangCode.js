var mongoose = require('mongoose');

var LangCodeSchema = new mongoose.Schema({
    code: String
});

module.exports = mongoose.model('LangCode', LangCodeSchema);
