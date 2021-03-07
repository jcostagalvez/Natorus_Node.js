const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required:[true, 'A User need to have a Name'],
    },
    email:{
        type: String,
        required:[true, 'A User need to have a email'],
        unique:true,
        lowercase: true,
        validate:[validator.isEmail, 'Please introduce a Email']
    },
    photo:{
        type: String,
    },

    rol:{
        type:String,
        enum:['user', 'guide', 'lead-guide', 'admin', ]
    },
    password:{
        type: String,
        required:[true, 'A User need to have a password'],
        minlength:8
    },
    passwordConfirm:{
        type: String,
        required:[true, 'A User need to have a passwordConfirm'],

        validate:{
            //This only work with Save or Create
            validator: function (val){
                return val === this.password;
            },

            message:'Passwordconfirm must be equal'
        }
    },

    passwordChnageAdt:{
        type: Date
    },

    passwordResetToken:{
        type: String
    },
    passwordResetExpired:{
        type: Date
    }
});

//Document Middelware

userSchema.pre('save', async function(next){

    if(!this.isModified('password')){

        return next();

    }else{
        this.password = await bcryptjs.hash(this.password, 12);
        this.passwordConfirm = undefined;
       
    }
    return next()
});

userSchema.pre('save', async function(next){

    if(!this.isModified('password')){

        return next();

    }else{

        this.passwordChnageAdt = Date.now() - 1000;

    }

    return next()
});

userSchema.methods.correctPasword = async function(plainPasword, encriptedPasword){
    return await bcryptjs.compare(plainPasword, encriptedPasword);
};

userSchema.methods.paswordHasChnage = function(JWTTimeSpam){

    let passwordChnageAdt = this.passwordChnageAdt;

    if(passwordChnageAdt){

        passwordChnageAdt = parseInt(this.passwordChnageAdt.getTime()/1000, 10);

        if(JWTTimeSpam < passwordChnageAdt){

            return true;

        }else{

            return false;
        }
    }

    return false
};

userSchema.methods.resetPasword = function(){

    const token = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpired = Date.now() + 30 * 60 * 1000;

    return token;
};

const User =  mongoose.model('User', userSchema);
module.exports = User;