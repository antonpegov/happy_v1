var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var jwt = require('jwt-simple');
var Theme = require('../models/Theme.js');
var Lang = require('../models/Lang.js');
var Notion = require('../models/Notion.js');
var LangCode = require('../models/LangCode.js');
var notionData = require('../services/notion-data.js');
var Admin = require('../models/Admin.js');
var passport = require ('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var adminCodeWord = 'Putin - Huilo, la-la-la-la-la-la-la-la!';

router.use(bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

router.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
});

function validate(pass){
    console.log('pass = ',pass);
    return (pass == 'flvbydjkr');
}

var validateAdminMiddlewareTmp = function(req, res, next) {

    console.log(('validateAdminMiddleware is turned OFF ! --------------------------------------------------------- ').red);
    next();
};
var validateAdminMiddleware = function(req, res, next) {
    console.log("AUTH HEADER:", req.headers.authorization);
    //Временный костыль
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
// Для отключения - поменять "validateAdminMiddleware" на "validateAdminMiddlewareTmp"
router.use('/', validateAdminMiddlewareTmp, express.static('../admin/app'));




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







//----------------------------------------------------------------
//----------------------------------------------------------------
//
//                               Пасспорт
//
//----------------------------------------------------------------
//----------------------------------------------------------------

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

//--------------------- Стратегия: Логин админа------------

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

passport.use('admin-login', loginStrategy);

//----------------- Стратегия: Регистрация пользователя------------

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

//===============

router.post('/register', passport.authenticate('admin-register'),function(req,res){
    console.log('Register req: ',req.body);
    createSendTokenForAdmin(req.user, res);
});

router.post('/login', passport.authenticate('admin-login'),function(req,res){
    console.log('Login req: ',req.body);
    createSendTokenForAdmin(req.user, res);
});


//------------------------------------------------------------------
//
// Функция приёма и сохранения массива понятий
//
// -----------------------------------------------------------------

router.post('/words', function(req,res){

    var rejected = [];
    var updCount = 0, newCount = 0;

    function addNotions(words, theme, lang1, lang2, callback){
        //return new Promise (function (resolve,reject){
            console.log(('(addNotes)------------------------------------------------------').yellow);
            words.forEach(function(item){
                // Проверка не наличие данных в свойствах lang1 и lang2
                if (typeof(item[lang1]) == 'undefined' || typeof(item[lang2]) == 'undefined'){
                    console.log('Type of lang1:', item[lang1],'Type of lang2:', item[lang2] );
                    return;
                }

                notionData.langRequest(lang1,item, function(isLang1){


                    if (!isLang1){  // Если lang1 отсутствует в базе:

                        notionData.langRequest(lang2, item, function(isLang2){

                            if (!isLang2){  // lang1 and lang2 NOT FOUND, пишем новый элемент базы

                                console.log(('lang1 and lang2 NOT FOUND, creating new element').blue);
                                if (!(notionData.addNewNotion(theme,lang1,item[lang1],lang2,item[lang2]))) {
                                    newCount++;
                                    console.log('newCount = ', newCount);
                                } else {
                                    console.log(('create Error!').red);
                                }

                            } else {        // Если lang2 есть, а lang1 отсутствует
                                console.log(('Only lang2 FOUND').yellow);
                                if (!notionData.updateNotion(isLang2, lang1, item[lang1])){
                                    updCount++;
                                    console.log('updCount = ', updCount);
                                } else {
                                    console.log(('update Error!').red);
                                }
                            }
                        });

                    } else {            // Если lang1 есть в базе

                        notionData.langRequest(lang2,item, function(isLang2){

                            if (!isLang2){  // Если lang1 есть, а lang2 отсутствует
                                console.log(('Only lang1 FOUND').yellow);
                                if (!notionData.updateNotion(isLang1, lang2, item[lang2])){
                                    updCount++;
                                    console.log('updCount = ', updCount);
                                } else {
                                    console.log(('update Error!').red);
                                }
                            } else {        // Если оба языка уже есть в базе, то отказ

                                rejected.push(item);
                                console.log(('lang1 and lang2 BOTH FOUND').red);

                            }
                        });
                    }
                });
               /* Notion.findOne(searchReq1, function(err,notion1){//----------------------------------!!!!!
                    if(err) return err;
                    console.log('sending request 2: ', searchReq2);
                    if(!notion1){
                        // lang1 NOT FOUND
                        console.log(('lang1 NOT FOUND, requesting lang2').green);
                        Notion.findOne(searchReq2, function(err,notion2){//--------------------------------!!!!!
                            if(err) return err;

                            if(!notion2){
                                // lang1 and lang2 NOT FOUND
                                //  Пишем новый элемент базы
                                console.log(('lang1 and lang2 NOT FOUND, creating new element').blue);

                                var newNotion = new Notion();
                                newNotion['theme'] = theme;
                                newNotion[lang1] = item[lang1];
                                newNotion[lang2] = item[lang2];

                                newNotion.save(newNotion,function(err){
                                    if (err) console.log(err);
                                    else {
                                        createdCount++;
                                        console.log('Item saved: ', newNotion);
                                    }
                                })

                            } else {

                                // Only notion2 FOUND
                                // Пишем lang1 к найденному notion2
                                console.log(('Only lang2 FOUND').yellow);
                                var upsertData = notion2.toObject();
                                upsertData[lang1] = item[lang1];
                                delete upsertData._id;

                                Notion.update({_id: notion2._id},upsertData,{upsert:true}, function(err){
                                    if (err) console.log(err);
                                    else{
                                        addedCount++;
                                        console.log(('UPDATING...  found: "'
                                        + notion2[lang2] + '" added: ' + item[lang1]).green);
                                        //console.log(('docId: ' +_id).yellow);
                                    }

                                })
                            }
                        })

                    } else {
                        // lang1 FOUND!!!
                        console.log(('lang1 FOUND, now requesting lang2').green);
                        Notion.findOne(searchReq2, function (err,notion2) {//----------------------------!!!!
                            if (err) return err;

                            if (!notion2) {

                                // lang1 NOT FOUND
                                // Пишем значение lang2 к найденному в базе notion1
                                console.log(('Only lang1 FOUND').yellow);

                                var upsertData = notion1.toObject();
                                upsertData[lang2] = item[lang2];
                                delete upsertData._id;

                                Notion.update({_id: notion1._id},upsertData,{upsert:true}, function(err){
                                    if (err) console.log(err);
                                    else{
                                        addedCount++;
                                        console.log(('UPDATING...  found: "'
                                        + notion1[lang1] + '" added: ' + item[lang2]).green);
                                        //console.log(('docId: ' +_id).yellow);
                                    }
                                })

                            } else {
                                //lang1 and lang2 BOTH FOUND
                                rejected.push(item);
                                console.log(('lang1 and lang2 BOTH FOUND').red);

                            }
                        })
                    }

                })*/
            });
        setTimeout(callback, 1000);
    }

    addNotions(req.body.words,req.body.theme,req.body.lang1,req.body.lang2, function(){

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



//-------------------------------------------------------------------
//
//            Модуль приёма и сохранения тем
//
//-------------------------------------------------------------------

router.post('/theme', function(req,res){

    //console.log('got POST request, body: ',req.body);
    var newTheme = new Theme({
        names: req.body.names
    });

    newTheme.save(function (err) {
        if(err) {
            res.status(412).send('Error');
            console.log(err);

        } else {
            console.log(('ADDING...  Language: "'
            + req.body.names.eng + '" ---------').green);

            res.status(200).send(newTheme);
        }
    });


});

router.put('/theme', function(req,res){

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
        console.log(('UPDATING...  Theme: "'
            + req.body.names.eng + '" ---------').green);
        res.status(200).send('Done');
        console.log(('docId: ' +_id).yellow);
    });
});

router.delete('/theme', function(req,res){

    //console.log('got request for DELETE, themeId: ',req.query.themeId);
    console.log(('DELETING...  Theme: "'
    + req.body.names.eng + '" ---------').green);

    Theme.find({ _id:req.query.themeId}).remove().exec();

    res.status(200).send(req.query.themeId + ' is deleted');
});


//-------------------------------------------------------------------
//
//            Модуль приёма и сохранения языков
//
//-------------------------------------------------------------------

router.post('/lang', function(req,res){

    //console.log('got request, body: ',req.body);
    var newLanguage = new Lang({
        code: req.body.code,
        names: req.body.names
    });

    newLanguage.save(function (err) {
        //console.log('body: ' ,req.body);
        //console.log('saving',newLanguage);
    });

    res.status(200).send(newLanguage);
});

router.put('/lang', function(req,res){

    var _id = req.body._id;
    delete req.body._id;

    Lang.update({_id: _id}, req.body, {upsert: true}, function (err) {
        if (err) {
            console.log(err.red);
            res.status(401).send('Error');
            return;
        }
        console.log(('UPDATING...  Language: "'
        + req.body.names.eng + '" ---------').green);
        res.status(200).send('Done');
        console.log(('docId: ' +_id).yellow);
    });


    /*    var newLanguage = new Lang({
     code: req.body.code,
     names: req.body.names
     });
     Lang.remove({ code:req.body.code },function(){

     newLanguage.save(function (err) {
     if(err) {
     console.log(err);
     res.status(401);
     return;
     }
     console.log('saving: ',newLanguage);
     res.status(200).send(newLanguage);
     });
     });*/
});

router.delete('/lang', function(req,res){

    //console.log('got request for DELETE, id: ',req.query.id);

    Lang.find({ code:req.query.id }).remove().exec();

    res.status(200).send(req.query.id + ' is deleted');
});




module.exports = router;