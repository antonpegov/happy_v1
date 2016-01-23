var mongoose = require('mongoose');

var LanguageSchema = new mongoose.Schema({
    code: String,
    names: {
        eng: String,
        rus: String,
        spa: String,
        fra: String,
        ita: String,
        deu: String,
        chn: String
    }
});

module.exports = mongoose.model('Lang', LanguageSchema);
