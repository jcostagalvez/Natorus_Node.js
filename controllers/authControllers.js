const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({id: id}, process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_EXPIRATION_DATE});

};

const filterObj = (obj, ...allwosFields) => {
  
    const newObject = {};

    Object.keys(obj).forEach(el => {
        if( allwosFields.includes(el )){
            newObject[el] = obj[el];
        }
    });
    
    return newObject;
};

const cookiesProperty = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    secure:false,
    httpOnly: true
};

exports.createSendToken = async(statusCode, newUser, req, res) => {

    try{

        const token = signToken(newUser._id);

        res.cookie('jwt', token, cookiesProperty);

        res.status(statusCode).json({
            status: 'succes',
            data:{
                user: user,
            }
        });

    }catch(err){
        res.status(400).json({
            status: 'fail',
            data:{
                error: err
            }
        });
    }
}

exports.signup = async(req, res, next) => {

    try{

        const newUser = await User.create(req.body);
        const token = signToken(newUser._id);

        res.status(200).json({
            status: 'succes',
            data:{
                newUser: newUser,
                token: token
            }
        });

    }catch(err){
        res.status(400).json({
            status: 'fail',
            data:{
                error: err
            }
        });
    }
};

exports.login = async (req, res) =>{

try{
    const { password, email } = req.body;

    // 1) Validate that email and password exist
    if(!password || !email){
        res.response(400).json({

            status: 'fail',

            data:{

                error: 'provide a email and a password'

            }
        })
    }
    
    // 2) check if user exist and pasword is correct
    const user = await User.findOne({email});

    if(!user || !(await user.correctPasword(password, user.password)) ){
        
        res.response(400).json({

            status: 'fail',

            data:{

                error: 'the user or the email is wrong'

            }
        })
    };

    // 3) Everything is ok, then send to the client
    const token = signToken(user._id);

    res.status(200).json({
        status: 'succes',
        data:{
            token: token
        }
    });
} catch(err){
    res.status(400).json({
        status: 'error',
        error:{
            err: err
        }
    })
}

};

exports.protect = async (req, res, next) => {

    try{

    //1) get token and check if exist
    let token;

    if(req.headers.authorization){

        token = req.headers.authorization;

    }

    if(!token){

        res.status(400).json({
            status: 'fail',
            data:{
                error: 'you must have a token'
            }
        });

    }

    //2) verifications token
    const {id, iat} = await jwt.verify(token, process.env.JWT_SECRET);
    
    //3) check if user still exist
    const user = await User.findById(id);

    if(!user){

        res.status(400).json({
            status: 'fail',
            data:{
                error: 'token dont longer exist'
            }
        });

    }

    //4) check if pasword has change after JWT
    const paswordChange = user.paswordHasChnage(iat);

    if(paswordChange != true){
        res.status(400).json({
            status: 'fail',
            data:{
                error: 'with your new pasword you will have a new token'
            }
        });
    }

    req.user = user;
    next();

    }catch(err){

        res.status(400).json({
            status: 'fail',
            data:{
                error: err
            }
        });
    }

};

exports.restrictTo = (...roles) =>{
    return  (req, res, next) => {

        if(!roles.includes(req.user.rol)){

            res.status(400).json({
                status: 'fail',
                data:{
                    error: 'Yo dont have the role necesary'
                }
            });

        }

        next();

    }
};

exports.forgotPassword = async function(req, res, next) {

    try{
    // verficiar si existe ese User con ese Email
    const user = await User.findOne({email: req.body.email});

    if(!user){
        res.status(400).json({
            status: 'fail',
            data:{
                error: 'The email yo introduce, is not valid'
            }
        })
    };

    //Reinicia la contraseña
    const newtoken = user.resetPasword();
    await user.save({validateBeforeSave: false});

    //send it as email
    const options = {
        email: user.email,
        subject: user.name,
        message:`This is your token to retrive your password ${newtoken}`
    };

    await sendEmail(options);

    res.status(200).json({
        status: 'succes',
        message: 'the token was send to you email'
    })
    

    }catch(err){
        res.status(400).json({
            status: 'fail',
            data:{
                error: err
            }
        })
    }
};

exports.resetPassword = async function(req, res, next) {

    try{
    // 1 GET USER BASED ON THE TOKEN
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpired: {$gt: Date.now()}
        });

        if(!user){

            res.status(400).json({
                status: 'fail',
                data:{
                    error: 'there iis no user with that token'
                }
            });

        };

    // 2 IF TOKEN HAS NOT EXPIRED, AND THERE IS USER, SET THE NEW PASSWORD
        if( user.passwordResetExpired < Date.now()){

            res.status(400).json({
                status: 'fail',
                data:{
                    error: 'The token is obsoleted now'
                }
            });  

        };

    // 3 UPDATE CHANGE PASSWORDAT PROPERTY FOR THE USER

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpired = undefined;
        //user.passwordChnageAdt = Date.now();
        
        await user.save({validateBeforeSave: false});

    // 4 LOG THE USER AND SENT JWT
    const newtoken = signToken(user.__id);

    const options = {
        email: user.email,
        subject: user.name,
        message:`This is your new token:  ${newtoken}`
    };

    await sendEmail(options);

    res.status(200).json({
        status: 'success',
        data:{
            message: 'The pasword is already changed'
        }
    });
    }catch(err){

        res.status(400).json({
            status: 'fail',
            data:{
                error: err
            }
        });
    }
};

exports.updatePassword = async function(req, res){

    try{

    //GET USER FROM COLLECTION
    const user = await User.findById(req.user._id).select('+password');

    if(!user){
        res.status(400).json({
            status: 'fail',
            data:{
                message: 'El usuario que buscas, no existe' 
            }
        });
    }

    //CHECK IF POSTED CURRENT PASSWORD IS CORRECT
    const isPasswordCorrect = user.correctPasword(req.body.passwordConfirm, user.password);
    
    if(!isPasswordCorrect){

        res.status(400).json({
            status: 'fail',
            data:{
                message: 'The PassWord is not correct' 
            }
        });

    }

    //IF SO UPDATE PASSWORD

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //LOG USER IN, SEND JWT
    const token = signToken(user._id);

    const options = {
        email : user.email,
        subject: 'Restauración de la contraseña ha sido un existo',
        message: `Este es tu nuevo token para acceder a la aplicación ${token}`
    };

    await sendEmail(options);
    
    res.status(400).json({
            status: 'succes',
            data:{
                user: user
            }
    });

    }catch(err){

        res.status(400).json({
            status: 'fail',
            data:{
                error: err
            }
        });

    }
}

exports.updateCurrentUser = async function(req, res){
    try{
    //CREATE A ERROR IF YOU TRY UPDATE THE PASSWORD
        if(req.password || req.passwordConfirm){
            res.status(400).json({
                status: 'fail',
                data:{
                    error: 'Please try to use this route to update password "/" '
                }
            });
        }
    //UPDATE THE USER

        const filterBody = filterObj(req.body, 'name', 'email');
        
        const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'fail',
            data:{
                userUpdate: user
            }
        });
    }catch(err){
        res.status(400).json({
            status: 'fail',
            data:{
                error: err
            }
        });
    }
    
}