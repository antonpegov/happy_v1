// config/passport.js
var LocalStrategy       = require('passport-local').Strategy;
var FacebookStrategy    = require('passport-facebook').Strategy;
var TwitterStrategy     = require('passport-twitter').Strategy;
var VKontakteStrategy   = require('passport-vkontakte').Strategy;
var GoogleStrategy      = require('passport-google-oauth20').Strategy;
//var User                = require('../node_modules/membership/models/user');
//var Membership          = require('membership');
var colors              = require('colors');
var configAuth          = require("../config/auth");
var mongoose            = require("mongoose");
var utility             = require("./utility");
var membership          = require('membership')(mongoose);

module.exports = function(passport) {

    var idFields = {// by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    };// список полей для паспорта
    passport.serializeUser(function(user, done) {
        done(null, user.authenticationToken);
    });
    passport.deserializeUser(function(token, done) {
        membership.findUserByToken(token, function(err, user) {
            done(err, user);
        });
    });
    passport.use('local-signup', new LocalStrategy(idFields,//=====Register
        function(req, email, password, done) {
            process.nextTick(function() {// wont fire unless data is sent back
                membership.register(email, password, req.body.confirmation, function(err, regResult){
                    if (err) return done(err);
                    if (regResult.success)
                        return done(null,regResult.user,{message: regResult.message});
                    else
                        return done(null,false,{message:regResult.message});
                });
            });
        }));
    passport.use('local-login', new LocalStrategy(idFields,//=====Login
        function(req, email, password, done) {
            membership.authenticate(email, password, function(err, authResult){
                if (err) return done(err);
                if (authResult.success){
                    done(null,authResult.user,{message:authResult.message});
                } else {
                    return done(null,false,{message:authResult.message});
                }
            });
        }));
    passport.use(new FacebookStrategy({
            // pull in our app id and secret from our auth.js file
            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL,
            passReqToCallback: true
        },//=====FACEBOOK
        function(req, token, refreshToken, profile, done) {// полученные данные
            process.nextTick(function() {// выполнить в следующем цикле событий
                membership.connect(req.user, token, refreshToken, profile, function (err, conResult) {
                    if (err) return done(err);
                    if (conResult.success)
                        return done(null, conResult.user, {message: conResult.message});
                    else
                        return done(null, false, {message: conResult.message});
                });
            });
        }));
    passport.use(new TwitterStrategy({
            consumerKey     : configAuth.twitterAuth.consumerKey,
            consumerSecret  : configAuth.twitterAuth.consumerSecret,
            callbackURL     : configAuth.twitterAuth.callbackURL,
            passReqToCallback: true
        },//=======TWITTER
        function(req,token, refreshToken, profile, done) {
            // delay until we have all our data back from Twitter
            process.nextTick(function() {
                membership.connect(req.user, token, refreshToken, profile, function(err,conResult) {
                    if (err) return done(err);
                    if (conResult.success)
                        return done(null, conResult.user, {message: conResult.message});
                    else
                        return done(null, false, {message: conResult.message});
                });
            });
        }));
    passport.use(new GoogleStrategy({
            clientID        : configAuth.googleAuth.clientID,
            clientSecret    : configAuth.googleAuth.clientSecret,
            callbackURL     : configAuth.googleAuth.callbackURL,
            passReqToCallback: true
        },//=========GOOGLE
        function(req, token, refreshToken, profile, done) {
            process.nextTick(function() {// delay until we have all data from Google
                membership.connect(req.user, token, refreshToken, profile, function(err,conResult){
                    if (err) return done(err);
                    if (conResult.success)
                        return done(null,conResult.user,{message: conResult.message});
                    else
                        return done(null,false,{message:conResult.message});


                });
            });
        }));
    passport.use(new VKontakteStrategy({
            clientID     : configAuth.vkontakteAuth.clientID,
            clientSecret  : configAuth.vkontakteAuth.clientSecret,
            callbackURL     : configAuth.vkontakteAuth.callbackURL,
            passReqToCallback: true
        },//===VKontakte
        function(req,token, refreshToken, profile, done) {
            // delay until we have all our data back from Twitter
            process.nextTick(function() {
                membership.connect(req.user, token, refreshToken, profile, function(err,conResult){
                    if (err) return done(err);
                    if (conResult.success) {
                        console.log("== BOOM! ==".blue, conResult);
                        return done(null, conResult.user, {message: conResult.message});
                    }
                    else {
                        console.log("== BOOM! ==".blue, conResult);
                        return done(null, false, {message: conResult.message});
                    }
                });
            });
        }));

};
