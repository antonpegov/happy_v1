var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var AdminSchema = new mongoose.Schema({
    email: String,
    password: String
});

AdminSchema.methods.toJSON = function(){
    var user = this.toObject();
    delete user.password;
    return user;
};

AdminSchema.methods.comparePasswords = function(password,callback){
    bcrypt.compare(password,this.password, callback);
};

AdminSchema.pre('save',function(next){
    var user = this;

    if(!this.isModified('password')) return next();

    bcrypt.genSalt(10,function(err,salt){
        if(err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err,hash){
            if (err) return next();

            user.password = hash;
            next();
        })
    })
});

module.exports = mongoose.model('Admin', AdminSchema);

