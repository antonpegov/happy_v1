// routes/profile.js
var express = require("express");
var router = express.Router();

module.exports = function(app,passport){

    app.use('/profile/',isLoggedIn, express.static('frontend/public/profile'));

};
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}