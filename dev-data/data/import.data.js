const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourSchema')
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});

const DB = process.env.MONGODB_HOSTED.replace('<PASSWORD>', process.env.MONGODB_PASSWORD);

mongoose.connect(DB, { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => console.log('Conected to Mongo'));

//READING THE FILE AND UPDATE THE DATABASE

const tourData = JSON.parse(fs.readFileSync(`${__dirname}/${process.env.JSON_FILE_TO_IMPORT}`, 'utf-8'));

const importData = async () =>{
    try{
        await Tour.create(tourData);
        console.log('data imported succesfully');
        process.exit();
    }catch(err){
        console.log(err);
        process.exit();
    }
};

//DELETE DATA FROM DATABASE

const deleteData = async () =>{
    try{
        await Tour.deleteMany();
        console.log('data deleted succesfully');
        process.exit();
    }catch(err){
        console.log(err);
        process.exit();
    }
};

//UTILIZAMOS LAS EXPRESIONES EN LA LINEA DE COMANDO DE --IMPORT O --DELETE PARA ESTABLECER UN CONDICIONAL DE EJECUCÍON
//Y ASI PODER LLAMAR A LAS FUNCIONES DESDE LA CONSOLA DE COMANDOS CON LA ARGUMENTACIÓN SIGUIENTE: node direccion del fichero [dev-data/data/import.data.json] --IMPORT OR --DELETE

if(process.argv[2] === '--IMPORT'){
    importData();
}else if(process.argv[2] === '--DELETE'){
    deleteData();
}