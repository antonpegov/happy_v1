var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var jwt = require('jwt-simple');
var Theme = require('../models/Theme.js');
var Lang = require('../models/Lang.js');
//var Notion = require('../models/Notion.js');
var LangCode = require('../models/LangCode.js');
var notionService = require('./notion-data.js'); // серфис для работы с понятиями
var Admin = require('../models/Admin.js');
var passport = require ('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var adminCodeWord = 'Putin - Huilo, la-la-la-la-la-la-la-la!';

router.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
});
router.use(bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
function validate(pass){
    console.log('pass = ',pass);
    return (pass == 'flvbydjkr');
}
var validateAdminMiddlewareTmp = function(req, res, next) {
    //console.log(('validateAdminMiddleware is turned OFF !').red);
    next();
};
var validateAdminMiddleware = function(req, res, next) {
    console.log("AUTH HEADER:", req.headers.authorization);
    //????????? ???????
    if(req.query && req.query.pass){
        console.log('pass = ',req.query.pass);
        if(validate(req.query.pass)) {
            console.log('WTF!!!');
            return next();
        }
    } else

    if(req.headers.authorization){
        var token = req.headers.authorization.split(' ')[1];
        var payload = jwt.decode(token, adminCodeWord);

        if(!payload.sub)
            return res.status(401).send({message:'Authentication failed'});

        next();
    } else {
        console.log('FUCK !');
        return res.status(401).send({message:'You are not authorized'});
    }
    //console.log(('Hello from staticMiddleware! ----------------------------------------------------------------------This = ').yellow);
    //next();
};
// Пока не отработана верификация, вместо
// "validateAdminMiddleware" используется заглушка "validateAdminMiddlewareTmp"
router.use('/', validateAdminMiddlewareTmp, express.static('frontend/admin/app'));

//Logging middleware
/*router.use(function TimeLog(req,res,next){
    console.log('Time: ',Date.now().toLocaleString());
    next();
});*/
// How To Do Redirections
/*
router.get('/',function(req,res,next){
    res.status(404);
    next();
},function(req, res, next){
    console.log('Redirecting "/admin" request'.red);
    res.redirect('/');
});
*/

/*----------------------------------------------------------------
            Функция создания JWT-ключа
--------------------------------------------------------------*/

function createSendTokenForAdmin(user, res){
    var payload = {
        sub: user.id
    };
    var token = jwt.encode(payload, adminCodeWord);
    res.status(200).send({
        user: user.toJSON(),
        token: token
    });
}
router.use(passport.initialize());
passport.serializeUser(function(user,done){
    done(null,user.id);
});
var idField = {usernameField:'email'};

/*-------------------------------------------------------------------
        Определяем стратегии логина и регистрации для админа,
        прописываем их в соответствующие паспорта и подключаем
-------------------------------------------------------------------*/

var loginStrategy = new LocalStrategy(idField, function(email, password, done){

    Admin.findOne({email: email}, function(err, user){
        if (err) return done(err);

        if (!user)
            return done(null, false,{
                message:"Wrong email"
            });

        user.comparePasswords(password, function(err, isMatch){
            if (err) return done(err);

            if(!isMatch)
                return done (null, false,{
                    message:"Wrong password"
                });
            return done(null, user);
        })
    })
});
var registerStrategy = new LocalStrategy(idField, function (email, password, done){
    Admin.findOne({email: email}, function(err, user) {
        if (err) return done(err);
        if (user)
            return done(null, false, {
                message: "email already exists"
            });
        var newAdmin = new Admin({
            email: email,
            password: password
        });
        newAdmin.save(function (err) {
            done(null, newAdmin);
        });
    });
});
passport.use('admin-register', registerStrategy);
passport.use('admin-login', loginStrategy);
router.post('/register', passport.authenticate('admin-register'),function(req,res){
    console.log('Register req: '.yellow,req.body);
    createSendTokenForAdmin(req.user, res);
});
router.post('/login', passport.authenticate('admin-login'),function(req,res){
    console.log('Login req: '.yellow,req.body);
    createSendTokenForAdmin(req.user, res);
});

/*-------------------------------------------------------------------
            Обработка запросов в раздел "понятия"
 -------------------------------------------------------------------*/
// используются функции из сервиса notion-data.js
router.post('/words', function(req,res){
    console.log('got POST request to "/words", body! '.blue);
    var rejected = []; // Массив для отбракованных слов
    var updCount = 0, newCount = 0; // Счётчики для notions - сколько создано новых и сколько обновлено
    notionService.addNotions(req.body.words,req.body.theme_id,req.body.lang1,req.body.lang2, function(){

        var answer = {
            rejected: rejected,
            added: newCount,
            updated: updCount
        };
        res.status(200).send(answer);
        console.log(('CALLBACK! Rejected: ').yellow, rejected.length
            ,('New words: ').green, newCount
            ,('Updated: ').blue,updCount);

    })
});

/*-------------------------------------------------------------------
            Обработка запросов в раздел "темы"
-------------------------------------------------------------------*/
// НЕОБХОДИМО ДОБАВИТЬ ПРОВЕРКУ НА ОТСУТСТВИЕ ДУБЛИРОВАНИЯ!!!
router.post('/themes', function(req,res){
    console.log('got POST request, body: '.blue,req.body);
    var newTheme = new Theme({
        names: req.body.names
    });
    newTheme.save(function (err) {
        if(err) {
            res.status(412).send('Error');
            console.log(err);
        } else {
            console.log(('ADDING...  Theme: "'
                + req.body.names.eng + '"').green);
            res.status(200).send(newTheme);
        }
    });
});
router.put('/themes', function(req,res){

    //console.log(('got PUT request, themeId: ' + req.body._id).grey);

    //var newTheme = new Theme({
    //    names: req.body.names
    //});
    // Convert the Model instance to a simple object using Model's 'toObject' function
    // to prevent weirdness like infinite looping...
    //var upsertData = newTheme.toObject();
    // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
    //delete upsertData._id;
    // Do the upsert, which works like this: If no Contact document exists with
    // _id = contact.id, then create a new doc using upsertData.
    // Otherwise, update the existing doc with upsertData

    var _id = req.body._id;
    delete req.body._id;

    Theme.update({_id: _id}, req.body, {upsert: true}, function (err) {
        if (err) {
            console.log(err.red);
            res.status(401).send('Error');
            return;
        }
        console.log(('UPDATING...  Theme: "'+ req.body.names.eng +'"').green);
        res.status(200).send('Done');
        console.log('docId: ' +_id);
    });
});
router.delete('/themes', function(req,res){
    // в запросе на удаление приходит только ID темы
    console.log('got request for DELETE, themeId: '.blue,req.query._id);
    console.log(('DELETING...').green);
    Theme.find({ _id:req.query._id}).remove().exec();
    res.status(200).send(req.query._id + ' is deleted');
});

/*-------------------------------------------------------------------
            Обработка запросов в раздел "языки"
-------------------------------------------------------------------*/
// НЕОБХОДИМО ДОБАВИТЬ ПРОВЕРКУ НА ОТСУТСТВИЕ ДУБЛИРОВАНИЯ!!!
router.post('/langs', function(req,res){
    //console.log('got request, body: ',req.body);
    var newLanguage = new Lang({
        code: req.body.code,
        names: req.body.names
    });
    newLanguage.save(function (err) {
        if (err) console.log(err.red);
        //console.log('body: ' ,req.body);
        //console.log('saving',newLanguage);
    });
    res.status(200).send(newLanguage);
});
router.put('/langs', function(req,res){
    var _id = req.body._id;
    delete req.body._id;
    Lang.update({_id: _id}, req.body, {upsert: true}, function (err) {
        var name = 'noname';
        if (err) {
            console.log(err.red);
            res.status(400).send('Error');
            return;
        }
        if(req.body.names.eng) name = req.body.names.eng;
        console.log(('UPDATING...  Language: "'
        + name + '" ---------').green);
        res.status(200).send('Done');
        console.log(('docId: ' +_id).yellow);
    });
});
router.delete('/langs', function(req,res){
    console.log('/langs got request for DELETE, _id: '.blue,req.query._id);
    Lang.find({ _id:req.query._id }).remove().exec();
    res.status(200).send(req.query._id + ' is deleted');
});

module.exports = router;
