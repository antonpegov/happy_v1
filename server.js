
//var Theme = require('./models/Theme.js');

var express         = require('express');// Необходимые модули
var mongoose        = require('mongoose');
var bodyParser      = require('body-parser');
var jwt             = require('jwt-simple');
var favicon         = require('serve-favicon');
var config          = require('./config/config.js'); // ipadress,port,db
var logger          = require('morgan');
var session         = require("express-session");
var cookieParser    = require('cookie-parser');
var passport        = require('passport');
var colors          = require('colors');
var ejs             = require("ejs");
var path            = require('path');
var flash           = require('connect-flash');

var router = express.Router();
var app = express();
var connectDB = function(){
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.db, options);
};
var isLoggedIn = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
};
global.mongoose = mongoose;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');// view engine setup
app.use(logger('dev'));
app.use(cookieParser('super secret'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'Hello World'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(logger('dev'));
app.use(favicon(__dirname + '/config/favicon.ico'));
app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
});

app.use('/', express.static('frontend/public/app'));
app.use('/profile', isLoggedIn, express.static('frontend/public/profile'));

require('./config/passport')(passport);
//require('./routes/admin.js')(passport);
require('./routes/auth.js')(app, passport);
require('./routes/profile.js')(passport);
require('./routes/api.js')(app, passport);


//------------ Блок воспитания Мангуста и запуск сервера ---------------------
mongoose.connection
    .on('open', function() {console.log("Connected to mongo server!".green);})
    .on('error', function(){console.log("ERROR".red)})
    .on('disconnected',function(){console.log("RECONNECT".yellow);connectDB()});
connectDB();//=== SERVER START
app.listen(config.port, config.ipaddress ,function(){
    console.log('Listening on '+ config.ipaddress +':'+ config.port +'...');
});
//var idField = {usernameField:'email'};
//var loginStrategy = new LocalStrategy(idField, function(email, password, done){
//
//    User.findOne({email: email}, function(err, user){
//        if (err) return done(err);
//        if (!user)
//            return done(null, false,{
//                message:"Wrong email"
//            });
//        user.comparePasswords(password, function(err, isMatch){
//            if (err) return done(err);
//            if(!isMatch)
//                return done (null, false,{
//                    message:"Wrong password"
//                });
//            return done(null, user);
//        })
//    })
//});
// app.use(connectSetTimeoutMiddleware(function(req,res){
//console.error('Response too slow at', req.method, req.url);
//}, 10000));
//var registerStrategy = new LocalStrategy(idField, function (email, password, done){
//    User.findOne({email: email}, function(err, user) {
//        if (err) return done(err);
//        if (user)
//            return done(null, false, {
//                message: "email already exists"
//            });
//        var newUser = new User({
//            email: email,
//            password: password
//        });
//        newUser.save(function (err) {
//            done(null, newUser);
//        });
//    });
//});
//var LocalStrategy = require('passport-local').Strategy;
//var userCodeWord = 'some words...';// Секретное слово для шифрования
//var User = require('./models/User.js');// Модели
//var Lang = require('./models/Lang.js');
//function createSendToken(user, res){
//    var payload = {
//        sub: user.id
//    };
//    var token = jwt.encode(payload, 'some words...');
//    res.status(200).send({
//        user: user.toJSON(),
//        token: token
//    });
//}
//function validateUserMiddleware(req, res, next) {
//    // Для временного отключения - поменять "validateAdminMiddleware" на "validateAdminMiddlewareTmp"
//    if(req.headers.authorization){
//        var token = req.headers.authorization.split(' ')[1];
//        var payload = jwt.decode(token,'some words...');
//        if(!payload.sub)
//            return res.status(401).send({message:'Authentication failed'});
//        next();
//    } else {
//        return res.status(401).send({message:'You are not authorized'});
//    }
//}
//function connectSetTimeoutMiddleware(cb, duration, options){
//    options = options || {};
//    options.timeoutName = options.timeoutName ||'timeoutCheck';
//    var timeoutName = options.timeoutName;
//
//    return function (req, res, next) {
//        res.connectSetTimeouts = res.connectSetTimeouts || {};
//        res.connectSetTimeouts[timeoutName] = setTimeout(function(){
//            return cb(req,res);
//        }, duration);
//        res.on('finish',function(evt){
//            clearTimeout(res.connectSetTimeouts[timeoutName]);
//        });
//        next();
//    };
//}

//passport.serializeUser(function(user,done){
//    done(null,user.id);
//});//=== Паспорт
//passport.use('local-login', loginStrategy);//=== Стратегия логина
//passport.use('local-register', registerStrategy);//=== Стратегия регистрация
//app.post('/register', passport.authenticate('local-register'),function(req,res){
//    console.log('Register req: ',req.body);
//    createSendToken(req.user, res);
//});
//app.post('/login', passport.authenticate('local-login'),function(req,res){
//    console.log('Login req: ',req.body);
//    createSendToken(req.user, res);
//});
//app.get('/reception',function(req,res){
//    //var token,payload;
//    if(req.headers.authorization){
//        var token = req.headers.authorization.split(' ')[1];
//        var payload = jwt.decode(token,'some words...');
//
//        if(!payload.sub)
//            res.status(401).send({
//                message:'Authentication failed'
//          });
//        if (!req.headers.authorization){
//            return res.status(301).send({
//                message:'You are not authorized'
//            });
//        }
//        res.send(jobs);
//    } else {
//        res.header(404).send('Go away!');
//    }
//});