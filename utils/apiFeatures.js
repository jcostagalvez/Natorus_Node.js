class APIFeatures {

    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
        this.queryObj = {...this.queryString};
        this.page;
    }

    filter(){
    // DECONSTRUIMOS LE OBJETO QUERY EN SUS DIFERENTES PROPIEDADES, CADA UNA DE ELLAS COMO UN OBJETO
        let {page, sort, limit, fields, ...fieldsFilters} = this.queryObj;      
    //SI HAY CONDICIONALES DE MAYOR O MENOR QUE SE LES AÑADE EL SIMBOLO DEL DOLAR   
        fieldsFilters = JSON.stringify(fieldsFilters).replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        fieldsFilters = JSON.parse(fieldsFilters);
    //SE CONSTRUYE LA QUERY CON LOS CAMPOS CONDICIONALES DE LA BUSQUEDA
        this.query.find(fieldsFilters);

        return this;
    };

    sort(){
        let {sort} = this.queryObj
    //AÑADIMOS UN VALOR DEFAULT PARA ORDENAR LAS BUSQUEDAS
            const defaultSortBy = '-createdAt';
    //MOSTRANDO LOS RESULTADOS CON EL METODO SORT (ACORTANDO POR PROPIEDAD)
           sort ? sort = sort.split(',').join(' ') : sort = defaultSortBy;
           this.query = this.query.sort(sort); 

           return this;
    };

    fields(){
        let {fields} = this.queryObj
    //MOSTRAMOs LOS FIELDS REQUERIEDOS EN LA REQUEST DE LA API
        fields ? fields = fields.split(',').join(' ') : fields = '-__v';
        this.query = this.query.select(fields);

        return this;
    };

    pagination(){
        let {page,limit} = this.queryObj
    //PAGINATION CON EL METODO SKIP LIMIT.
        this.page = page * 1 || 1;
        limit = limit * 1 || 100;
        const skip = (this.page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    };
};

module.exports = APIFeatures;