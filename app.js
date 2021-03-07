const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const helmet = require('helmet');
const app = express();
const xss = require('xss-clean')
const sanitaze = require('express-mongo-sanitize');
const hpp = require('hpp');

//MIDDELWARE
app.use(helmet());

//Data sanitization no soql injection.
app.use(sanitaze());

// Data sanitazion against xss
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
    whitelist:[

        'duration',
        'raitingquantity',
        'raitingAverage',
        'maxGroupSize',
        'difficulty',
        'price'
        
    ]
}));
//MIDDLERWARE PARA EVITAR QUE SE HAGAN X LLAMADAS A LA API EN UN TIEMPO X
const limiter = rateLimit({
    max: 150,
    windowMs:60 * 60 * 1000,
    message: 'You cant make more API calls, try one hour later'
});

app.use('/api', limiter);

//Midelware para la utilizción de Json files en express
app.use(express.json());

//Midelware para la lectura de documento estaticos dentro de las diferentes carpetas
app.use(express.static(`${__dirname}/public`));

//Midelware que hace debug de las llamadas a las api
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Midelware para las enrutaciónes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);



module.exports = app;