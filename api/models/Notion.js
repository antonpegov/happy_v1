
var mongoose = require('mongoose');
var NotionSchema = new mongoose.Schema({
    theme: String,
    rus: String,
    eng: String,
    spa: String,
    fra: String,
    deu: String,
    chn: String

});
module.exports = mongoose.model('Notion',NotionSchema);