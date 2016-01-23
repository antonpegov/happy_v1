var mongoose = require('mongoose');

var ThemeSchema = new mongoose.Schema({
    names: {
        eng: String,
        rus: String,
        spa: String,
        fra: String,
        deu: String,
        ita: String,
        chn: String
    }
});

module.exports = mongoose.model('Theme', ThemeSchema);
