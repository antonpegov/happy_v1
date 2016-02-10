var Theme           = require('../models/theme.js');
var Notion          = require('../models/notion.js');
var Lang            = require('../models/lang.js');
var notionService   = require('../services/notion-data.js');// Сервисы
var express         = require("express");
var config          = require("../config/config.js");
//var router = express.Router;

module.exports = function(app,passport) {

    app.get('/themes', function (req, res) {
        //console.log("Got request: ".blue + req.method +' '+ req.url);
        Theme.find(function (err, themes) {
            if (err) {  //  ошибка
                console.log(err.red, req.method, req.url);
                res.status(500).end();
                return err;
            } else if (!themes) {  // undefined
                res.status(404).end();
                console.log('Got undefined!'.red);
            } else if (themes.length === 0) {  // пустой массив
                res.status(200).send(themes);
                console.log('Sending empty array');
            } else {
                res.status(200).send(themes);
                //console.log('Sending themes');
                //console.log('Themes: ', themes);
            }
        });
    });//=== Выдача массива тем ===
    app.get('/langs', function (req, res) {
        //console.log("Got request: ".blue + req.method +' '+ req.url);
        Lang.find(function (err, langs) {
            if (err) { // ошибка
                console.log(err.red, req.method, req.url);
                res.status(500).end();
                return err;
            } else if (!langs) {  // undefined
                res.status(404).end();
                console.log('Got undefined!'.red);
            } else if (langs.length === 0) {  // пустой массив
                res.status(200).send(langs);
                console.log('Sending empty array');
            } else {
                res.status(200).send(langs);
                //console.log('Sending languages');
                //console.log('Langs: ', langs);
            }
        });
    });//=== Выдача массива языков
    app.get('/codes', function (req, res) {
        //console.log("Got request: ".blue + req.method +' '+ req.url);
        notionService.getLangCodesAll(function (err, codes) {
            if (err) { // ошибка
                console.log(err.red, req.method, req.url);
                res.status(500).end();
                return err;
            } else if (!codes) {  // undefined
                res.status(404).end();
                console.log('Got undefined!'.red);
            } else if (codes.length === 0) {  // пустой массив
                res.status(200).send(codes);
                console.log('Sending empty array');
            } else {
                res.status(200).send(codes);
                //console.log('Sending language codes');
                //console.log('Langs: ', langs);
            }
        });
    });//=== Выдача массива кодов
    app.get('/words', function (req, res) {
        console.log("Got request: ".blue + req.method + ' ' + req.url);
        if (req.query.theme_id) {
            // Если в запросе есть тема перенаправляем запрос сервису и отдаём его результат
            notionService.getWordsByThemeAndLangs(req.query.theme_id, req.query.lang1, req.query.lang2, function (err, words) {
                if (err) {
                    console.log(err.red, req.method, req.url);
                    res.status(500).end();
                    return err;
                } else if (!words) {  // undefined
                    res.status(404).end();
                    console.log('Got undefined!'.red);
                } else if (words.length === 0) {  // пустой массив
                    res.status(200).send({words: words, theme: req.query.theme_id});
                    //console.log('Sending empty array');
                } else {
                    res.status(200).send({words: words, theme: req.query.theme_id});
                    //console.log('Sending words');
                    //console.log('Words: ', words);
                }
            });
        } else {
            res.status(400).end();
            console.log('Got bad request '.red, req.method, req.url);
            console.log('No theme in request: ', req.query.theme_id);
        }
    });//=== Выдача массива слов по запросу 'Тема:Язык1:Язык2'
    app.get('/demothemes', function (req, res) {
        //console.log("Got request: ".blue + req.method +' '+ req.url);
        if (config.demothemes === undefined) {
            console.log('Демо-темы не заданы!'.red);
            res.status(400).end();
            return;
        }
        // Запрашиваем документы, у которых _id совпадает с элементами массива демо-тем
        Theme.where('_id').in(config.demothemes).exec(function (err, themes) {
            if (err) {
                console.log(err, req.method, req.url);
                res.status(500).end();
                return err;
            } else {
                //console.log("Sending Themes... ");
                res.status(200).send(themes);
            }
        })
    });//=== Выдача массива Id демотем
};