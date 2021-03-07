const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true, 'a tour must have a name'],
        unique:true,
        trim:true,
        maxlength:[40, 'A tour name cant be longer than 40 caracters'],
        minlength:[10, 'A tour name cant be smaller than 10 caracters'],
        validate:[validator.isAlpha, 'A tour name must contains only letters']
    },
    duration:{
        type:Number,
        required:[true, 'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true, 'A tour must have a group size']
    },
    difficulty:{
        type: String,
        required:[true, 'A tour must have a difficulty'],
        enum:{
            values:['easy', 'medium', 'difficult'],
            message: 'Difficulty must be: easy, medium or difficult'
        }

    },
    raitingAverage:{
        type:Number,
        default:4.5
    },
    raitingQuantity:{
        type:Number,
        default:0
    },
    price: {
        type:Number,
        required: [true, 'a tour must have a price'],
    },
    priceDiscount: {
        type:Number,

        validate: {

            //SOLO FUNCIONA CUANDO SE CREA UN DOCUMENTO Y NO CUANDO SE ACTUALIZA (VAYA MIERDA);
            validator: function (val){

                return val <= this.price
            },
            message: 'Discount price can be higer or equal to tour price'
        }
    },
    summary:{
        type:String,
        required:[true, 'a tour must have a summary'],
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true, 'a tour must have a cover image']
    },
    images:{
        type:[String]
    },
    createdAt:{
        type:Date,
        default: Date.now(),
        select:false
    },
    startDates:{
        type:[Date]
    },
    secretTour:{
        type:Boolean,
        default: false
    },
    startLocations:{
        type:{
            type: String,
            default: 'point',
            enum:['point']
        },

        coordinate: [Number],
        address: String,
        description: String
    },
    locations: {
        type:{
            type:String,
            default: 'point',
            enum: ['point']
        },
        coordinate:[Number],
        address:String,
        description:String,
        day:Number

    },
},
{
    toJSON:{virtuals: true},
    toObject:{virtuals:true}
});

tourSchema.virtual('duarationWeaks').get(function(){
    return this.duration / 7
});

//MIDELWARE, DOCUMENTS MIDELWARE: run before if are pre o after if are post of the methods save() and create() in moongose

tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower:true});
    next();
});

//QUERY MIDELWARE

tourSchema.pre('/^find/', function(next){
    this.find({secretTour:{$ne: true}});
    next();
});

tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift( { $match:{ secretTour:{$ne: true } } } );
    next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;