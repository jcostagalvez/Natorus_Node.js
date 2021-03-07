const Tour = require('../models/tourModel');
const apiFeatures = require('./../utils/apiFeatures');

exports.fiveCheperTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();

};

exports.createTour = async (req, res) => {

try{

    const newTour = await Tour.create(req.body);

    res.status(200).json({
        status: 'succes',
        data:{
            newTour: newTour
        }
    });

}catch(err){
    res.status(404).json({
        status: 'fail',
        data:{
            error: err
        }
    })
}

};

exports.getAllTours = async (req, res) => {
    try{

        const features = new apiFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .fields()
        .pagination();

    //EJECUTAMOS LA QUERY   
        const tour = await features.query;

    //EJECUTAMOS UN ERROR SI DEVUELVE 0 REGISTROS Y POR TANTO INDICA QUE EN ESA PAGINA NO HAY RECORDS
        if(features.page > 1 && tour.length === 0) throw new Error('This page doesnt exist');
    
        //Devolvemos la llamada con la respuesta
        res.status(200).json({
            status: 'success',
            totalResults: tour.length,
            data:{
                tour: tour
            }
        });
    }catch(err){
        res.status(400).json({
            status: 'fail',
            data:{
                error: 'record dont found'
            }
        });
    }
};

exports.getTour = async (req, res) => {
    try{
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data:{
                tour: tour
            }
        });
    }catch(err){
        res.status(400).json({
            status: 'fail',
            data:{
                error: 'record dont found'
            }
        });
    }
};

exports.updateTour = async (req, res) => {

    try{
        console.log('pasa por aqui ' + req.body.name)
        
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,
            // Objeto de opciones de la query
            {
                // Opcion para que no devuelva el registro antes de la actualización
                new:true,
                // Opcion para que los validadores del esquema permanezcan activos
                runValidators: true,
                // Opcion para elegir que campos aparecen
                select:{name:1, 
                        price: 1}
            }
        );
    
        res.status(200).json({
            status: 'succes',
            data:{
                tour: tour
            }
        });
    
    }catch(err){
        res.status(404).json({
            status: 'fail',
            data:{
                message: 'We can update your data'
            }
        })
    }
};

exports.deleteTour = async (req, res) => {
    try{

        await Tour.findByIdAndDelete(req.params.id);
    
        res.status(200).json({
            status: 'succes',
            data:{
                tour: 'this tour, have been delete'
            }
        });
    
    }catch(err){
        res.status(404).json({
            status: 'fail',
            data:{
                message: 'We can update your data'
            }
        });
    }
};

exports.getTourStats = async (req, res) => {
    try{
        const filterMatch = req.query.match;
        console.log(filterMatch);
        
        const stats = await Tour.aggregate([
            {
                $match:{ raitingAverage:{$gte: 4.5 } }
            },

            {
                $group:{
                    _id: '$difficulty',
                    numTours:{ $sum: 1},
                    avgRaiting:{ $avg: '$raitingAverage' },
                    avgPrice:{ $avg: '$price' },
                    minPrice:{ $min: '$price' },
                    maxPrice:{ $max: '$price' },
                },

            },
            {
                $sort: {avgPrice : 1},
            },
        ]);

        res.status(200).json({
            status:'succes',
            data:{
                stats
            }
        })
    }catch(err){
        res.status(404).json({
            status: 'fail',
            data:{
                message: 'we can fin the object cluster, you request'
            }
        })
    }
};

exports.getMonthlyPlan = async (req, res) => {
    
    try{
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind:'$startDates'
            },

            {
                $match:{
                    startDates:{ 
                        $gte: new Date( `${year}-01-01` ),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month: '$startDates'},
                    numToursStart:{ $sum: 1},
                    tours: {$push: '$name'}
                }
            },

            {
                $addFields: {month: '$_id'}
            },
            {
                $project:{
                    _id: 0
                }
            },
            {
                $sort: {numToursStart: -1}
            },
            {
                $limit:12
            }

        ])

        res.status(200).json({
            status: 'succes',
            data:{
                plan
            }
        });

    }catch(err){
        res.status(404).json({
            status: 'fail',
            data:{
                message: 'We can update your data'
            }
        });
    }
};