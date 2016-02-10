// routes/auth_control.js
var express = require("express");
//var passport = require("passport");
var colors = require("colors");

module.exports = function(app, passport) {

    //var account = express.Router();
    //account.use('/', isLoggedIn, express.static('account'));
    // для регистрации на адрес /signup должны прийти login+password


    // LOCAL AUTH ROUTES =====================
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile/index.html', // redirect to the secure profile section
        failureRedirect : 'back', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile/', // redirect to the secure profile section
        failureRedirect : 'back', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // FACEBOOK ROUTES =====================
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    app.get('/auth/facebook/callback',// handle the callback after facebook has authenticated the user
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // TWITTER ROUTES ======================
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // GOOGLE ROUTES =======================
    app.get('/auth/google', passport.authenticate('google',
        { scope : ['profile', 'email'] }));
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // VK ROUTES =======================
    app.get('/auth/vkontakte', passport.authenticate('vkontakte',
        { scope : ['profile', 'email'] }));
    app.get('/auth/vkontakte/callback',
        passport.authenticate('vkontakte', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
    app.get('/connect/facebook/callback',// callback after facebook has authorized the user
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
    app.get('/connect/twitter/callback',// callback after twitter has authorized the user
        passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));
    app.get('/connect/google/callback',// the callback after google has authorized the user
        passport.authorize('google', {
            successRedirect : '/profile/',
            failureRedirect : '/'
        }));
    // send to vkontakte to do the authentication
    app.get('/connect/vkontakte', passport.authorize('vkontakte', { scope : ['profile', 'email'] }));
    app.get('/connect/google/callback',// the callback after google has authorized the user
        passport.authorize('vkontakte', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future
    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
    // vkontakte-------------------------------
    app.get('/unlink/vkontakte', function(req, res) {
        var user          = req.user;
        user.vkontakte.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });// route for logging out
};
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}


//app.use(function(req,res,next){
//    res.header('Access-Control-Allow-Origin','*');
//    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
//    res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
//    next();
//});