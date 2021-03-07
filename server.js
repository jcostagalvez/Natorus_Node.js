const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({path: './config.env'});



const DB = process.env.MONGODB_HOSTED.replace('<PASSWORD>', process.env.MONGODB_PASSWORD);

mongoose.connect(DB, { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => console.log('Conected to Mongo'));

const port = process.env.PORT;
app.listen(port, () =>{
    console.log('all OK');
})