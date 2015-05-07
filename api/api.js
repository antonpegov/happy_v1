var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var User = require('./models/User.js');
var Lang = require('./models/Lang.js');
var Theme = require('./models/Theme.js');
var LangCode = require('./models/LangCode.js');
var Notion = require('./models/Notion.js');
var admin = require('./services/router-admin.js');
var jwt = require('jwt-simple');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var colors = require('colors');
var jobs = ['Плотник','Столяр','Пекарь','Пахарь'];
var userCodeWord = 'some words...';
var app = express();
var port = process.env.PORT;
var config = require('./config.js');
var notionData = require('./services/notion-data.js');
var db_address = config.db;
var db;

app.use(bodyParser.json());

app.use(function(req,res,next){
 res.header('Access-Control-Allow-Origin','*');
 res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
 res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
 next();
 });

app.use('/admin', admin);
//app.use(express.logger('dev'));
app.use('/', express.static('../public/app'));

var connectSetTimeoutMiddleware = function(cb, duration, options){
    
    options = options || {};
    options.timeoutName = options.timeoutName ||'timeoutCheck';
    var timeoutName = options.timeoutName;
    
    return function (req, res, next) {
    
        res.connectSetTimeouts = res.connectSetTimeouts || {};
        res.connectSetTimeouts[timeoutName] = setTimeout(function(){
            return cb(req,res);
        }, duration);
        res.on('finish',function(evt){
            clearTimeout(res.connectSetTimeouts[timeoutName]);
        });
        next();
    };
};
app.use(connectSetTimeoutMiddleware(function(req,res){
    console.error('Response too slow at', req.method, req.url);
}, 10000));



//----------------------------------------------------------------
//
//       Статик роут для Админки, защищённый проверкой токена
//
//----------------------------------------------------------------
var validateUserMiddlewareTmp = function(req, res, next) {

    //console.log(('validateAdminMiddleware is turned OFF ! --------------------------------------------------------- ').red);
    next();
};
var validateUserMiddleware = function(req, res, next) {

   if(req.headers.authorization){
        var token = req.headers.authorization.split(' ')[1];
        var payload = jwt.decode(token,'some words...');

        if(!payload.sub)
            return res.status(401).send({message:'Authentication failed'});

        next();
    } else {
        return res.status(401).send({message:'You are not authorized'});
    }
    //console.log(('Hello from staticMiddleware! ----------------------------------------------------------------------This = ').yellow);
    //next();
};

// Для временного отключения - поменять "validateAdminMiddleware" на "validateAdminMiddlewareTmp"




//----------------------------------------------------------------
//----------------------------------------------------------------
//
//                               Пасспорт
//
//----------------------------------------------------------------
//----------------------------------------------------------------

app.use(passport.initialize());

passport.serializeUser(function(user,done){
    done(null,user.id);
});

var idField = {usernameField:'email'};

//--------------------- Стратегия: Логин пользователя------------

var loginStrategy = new LocalStrategy(idField, function(email, password, done){

    User.findOne({email: email}, function(err, user){
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

passport.use('local-login', loginStrategy);

//----------------- Стратегия: Регистрация пользователя------------

var registerStrategy = new LocalStrategy(idField, function (email, password, done){

    User.findOne({email: email}, function(err, user) {
        if (err) return done(err);

        if (user)
            return done(null, false, {
                message: "email already exists"
            });

        var newUser = new User({
            email: email,
            password: password
        });

        newUser.save(function (err) {
            done(null, newUser);
        });
    });
});

passport.use('local-register', registerStrategy);


//=========

function createSendToken(user, res){

    var payload = {
        sub: user.id
    };

    var token = jwt.encode(payload, 'some words...');

    res.status(200).send({
        user: user.toJSON(),
        token: token
    });
}

//========

app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
});

app.post('/register', passport.authenticate('local-register'),function(req,res){
    console.log('Register req: ',req.body);
    createSendToken(req.user, res);
});

app.post('/login', passport.authenticate('local-login'),function(req,res){
    console.log('Login req: ',req.body);
    createSendToken(req.user, res);
});

app.get('/reception',function(req,res){

    //var token,payload;

    if(req.headers.authorization){
        var token = req.headers.authorization.split(' ')[1];
        var payload = jwt.decode(token,'some words...');

        if(!payload.sub)
            res.status(401).send({
                message:'Authentication failed'
          });
        if (!req.headers.authorization){
            return res.status(301).send({
                message:'You are not authorized'
            });
        }
        res.send(jobs);
    } else {
        res.header(404).send('Go away!');
    }

});


//-------------------------------------------------------------------
//
//            Модуль вставки, удаления и изменения языков
//
//------------------------------------------------------------------

app.get('/lang', function(req,res){

    Lang.find(function(err,langs){
        if(err) return err;
        if(!langs){
            res.send('Empty');
            console.log('no languages found');
            return;


        }
        res.status(200).send(langs);

        //console.log('Langs: ', langs);
    });
});


//-------------------------------------------------------------------
//
//            Модули выдачи списка тем и языковых кодов
//
//------------------------------------------------------------------

app.get('/theme', function(req,res){

    Theme.find(function(err,themes){
        if(err) return err;
        if(themes.length === 0){
            res.status(404);
            console.log('no themes found');
            return;
        }
        res.status(200).send(themes);

        //console.log('Themes: ', themes);
    });
});

//=====

app.get('/codes', function(req,res){

    LangCode.find(function(err,codes){
        if(err) return err;
        if(!codes){
            res.status(404);
            console.log('no cods found');
            return;
        }

        res.status(200).send(codes);
        //console.log('Codes: ',codes);
    });
});

//=====

app.get('/words', function(req, res) {
    
    if(!req.query.theme || !req.query.lang1 || !req.query.lang2) {
        res.status(400).end();
        console.log('got bad request at', req.method, req.url);
        return;
    }
    notionData.getWordsByTheme(req.query.theme, req.query.lang1, req.query.lang2, function(err, words){
        if (err) console.log(err);
        console.log(words);
        res.send(words);
    });
    
});

//-------------------------------------------------------------------
//
//            Модуль воспитания Мангуста
//
//------------------------------------------------------------------

mongoose.connection.on("open", function(ref) {
    return console.log("Connected to mongo server!".green);
});

mongoose.connection.on("error", function(err) {
    console.log("Could not connect to mongo server!".yellow);
    return console.log(err.message.red);
});

try {
    mongoose.connect(db_address);
    db = mongoose.connection;
    console.log("Started connection on " + (db_address) + ", waiting for it to open...".grey);
} catch (err) {
    console.log(("Setting up failed to connect to " + db_address).red, err.message);
}


//=================================

//=================================

//=================================


var server = app.listen(port,function(){
    console.log('listening on port '+ port +'...');
});