// Модели для Мангуста
var User = require('./models/User.js');
var Lang = require('./models/Lang.js');
var Theme = require('./models/Theme.js');
var Notion = require('./models/Notion.js');
// Сервисы
var notionService = require('./services/notion-data.js');
// Необходимые модули
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var colors = require('colors');
var config = require('./config.js'); // Загрузка настроек: ipadress,port,db
// Секретное слово для шифрования
var userCodeWord = 'some words...';
var app = express();
// Настройка плагинов (middleware)
app.use(bodyParser.json());
app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
 });
app.use('/', express.static('frontend/public/app'));
app.use('/admin', require('./services/router-admin.js'));
//app.use(express.logger('dev'));

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
//       Статик роут для Админки, защищённый проверкой токена
//----------------------------------------------------------------

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
};
// Для временного отключения - поменять "validateAdminMiddleware" на "validateAdminMiddlewareTmp"
//----------------------------------------------------------------
//                               Пасспорт
//----------------------------------------------------------------
app.use(passport.initialize());
passport.serializeUser(function(user,done){
    done(null,user.id);
});
var idField = {usernameField:'email'};
// ------------ Стратегия: Логин пользователя
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
// -------------- Стратегия: Регистрация пользователя
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
//            Блок выдачи печенек
//------------------------------------------------------------------
// === Выдача массива тем ===
app.get('/themes', function(req,res){
    console.log("Got request: ".blue + req.method +' '+ req.url);
    Theme.find(function(err,themes){
        if(err){  //  ошибка
            console.log(err.red, req.method, req.url);
            res.status(500).end();
            return err;
        } else if (!themes){  // undefined
            res.status(404).end();
            console.log('Got undefined!'.red);
        } else if (themes.length === 0) {  // пустой массив
            res.status(200).send(themes);
            console.log('Sending empty array');
        } else {
            res.status(200).send(themes);
            console.log('Sending themes');
            //console.log('Themes: ', themes);
        }
    });
});
//=== Выдача массива языков ===
app.get('/langs', function(req, res){
    console.log("Got request: ".blue + req.method +' '+ req.url);
    Lang.find(function(err,langs){
        if(err){ // ошибка
            console.log(err.red, req.method, req.url);
            res.status(500).end();
            return err;
        } else if (!langs) {  // undefined
            res.status(404).end();
            console.log('Got undefined!'.red);
        } else if (langs.length === 0){  // пустой массив
            res.status(200).send(langs);
            console.log('Sending empty array');
        } else {
            res.status(200).send(langs);
            console.log('Sending languages');
            //console.log('Langs: ', langs);
        }
    });
});
//=== Выдача массива кодов ===
app.get('/codes', function(req, res){
    console.log("Got request: ".blue + req.method +' '+ req.url);
    notionService.getLangCodesAll(function(err,codes){
        if(err){ // ошибка
            console.log(err.red, req.method, req.url);
            res.status(500).end();
            return err;
        } else if (!codes) {  // undefined
            res.status(404).end();
            console.log('Got undefined!'.red);
        } else if (codes.length === 0){  // пустой массив
            res.status(200).send(codes);
            console.log('Sending empty array');
        } else {
            res.status(200).send(codes);
            console.log('Sending language codes');
            //console.log('Langs: ', langs);
        }
    });
});

/*=== Выдача массива кодов ===
app.get('/codes', function(req, res){
    console.log("Got request: ".blue + req.method +' '+ req.url);
    LangCode.find(function(err,codes){
        if(err){ // если ошибка
            console.log(err.red, req.method, req.url);
            res.status(500).end();
            return err;
        } else if (!codes) {  // undefined
                res.status(404).end();
                console.log('Got undefined!'.red);
        } else if (codes.length === 0){  // пустой массив
            res.status(200).send(codes);
            console.log('Sending empty array');
        } else { // всё в порядке
            res.status(200).send(codes);
            console.log('Sending codes');
            //console.log('Codes: ', codes);
        }
    });
});
*/
//=== Выдача массива слов по запросу 'Тема:Язык1:Язык2' ===
app.get('/words', function(req, res) {
    console.log("Got request: ".blue + req.method +' '+ req.url);
    if(req.query.theme) {
        // Если в запросе есть тема перенаправляем запрос сервису и отдаём его результат
        notionService.getWordsByThemeAndLangs(req.query.theme, req.query.lang1, req.query.lang2, function (err, words) {
            if (err) {
                console.log(err.red, req.method, req.url);
                res.status(500).end();
                return err;
            } else if (!words) {  // undefined
                res.status(404).end();
                console.log('Got undefined!'.red);
            } else if (words.length === 0) {  // пустой массив
                res.status(200).send({words:words,theme:req.query.theme});
                console.log('Sending empty array');
            } else {
                res.status(200).send({words:words,theme:req.query.theme});
                console.log('Sending words');
                //console.log('Words: ', words);
            }
        });
    } else {
        res.status(400).end();
        console.log('Got bad request '.red, req.method, req.url);
        console.log('No theme in request: ',req.query);
    }
});
// === Получение списка тем для демо из файла конфигурации ===
app.get('/demothemes',function(req,res){
    console.log("Got request: ".blue + req.method +' '+ req.url);
    if (config.demothemes === undefined) {
        console.log('Демо-темы не заданы!'.red);
        res.status(400).end();
        return;
    }
    // Запрашиваем документы, у которых _id совпадает с элементами массива демо-тем
    Theme.where('_id').in(config.demothemes).exec(function(err,themes){
        if(err){
            console.log(err, req.method, req.url);
            res.status(500).end();
            return err;
        } else {
            console.log("Sending Themes... ");
            res.status(200).send(themes);
        }        
    })    
});

//------------------------------------------------------------------
//            Блок воспитания Мангуста
//------------------------------------------------------------------

mongoose.connection.on("open", function(ref) {
    return console.log("Connected to mongo server!".green);
}).on("error", function(err) {
    console.log("Could not connect to mongo server!".yellow);
    return console.log(err.message.red);
});
try {
    mongoose.connect(config.db);
    var db = mongoose.connection;
    //console.log("Started connection on " + (config.db) + ", waiting for it to open...".grey);
} catch (err) {
    console.log(("Setting up failed to connect to " + config.db).red, err.message);
}

//=== S T A R T ! ===
var server = app.listen(config.port, config.ipaddress, function(){
    console.log(('Listening on '+config.ipaddress+':'+config.port+'...').green);
});