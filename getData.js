const getParameterByName = require('./getParameterByName');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    // log: 'trace'
});

module.exports = function getData(index, type, size, page, search) {

    return new Promise((resolve, reject) => {
        if( search !== undefined && search !== null )
        {
            if (!( Math.floor(page) === Math.ceil(page) && page > 0 )) {
                console.error("Pages are intended to be positive integers");
                return resolve(null);
            } else if (!( Math.floor(size) === Math.ceil(size) && size > 0 )) {
                console.error("Pages size are intended to be positive integers");
                return resolve(null);
            }

            var name = getParameterByName('name', search);
            var description = getParameterByName('description', search);
            var ratingLo = getParameterByName('ratingLo', search);
            var ratingHi = getParameterByName('ratingHi', search);
            var priceLo = getParameterByName('priceLo', search);
            var priceHi = getParameterByName('priceHi', search);

            var must = [];
            var filter = [];
            if (name || description || ratingLo || ratingHi || priceLo || priceHi) { // if any parameter was injected

                var i = 0; // for queries array
                if (name !== null && name !== "") {
                    must[i++] = {"match": {"name": name}};
                }
                if (description !== null && description !== "") {
                    must[i++] = {"match": {"description": description}};
                }

                var j = 0; // for filters array
                if (ratingLo !== null && ratingHi !== null) {
                    if (ratingLo !== "" && ratingHi !== "") {
                        if (isNaN(ratingLo) || isNaN(ratingHi)) {
                            console.error("Rating requires a number!");
                            return resolve(null)
                        } else if (ratingHi < ratingLo) {
                            console.error("Rating lower bound was greater than upper bound!");
                            return resolve(null)
                        } else {
                            filter[j++] = {"range": {"rating": {"gte": ratingLo, "lte": ratingHi}}};
                        }
                    } else if (ratingLo !== "") {
                        if (isNaN(ratingLo)) {
                            console.error("Rating requires a number!");
                            return resolve(null)
                        } else {
                            filter[j++] = {"range": {"rating": {"gte": ratingLo}}};
                        }
                    } else if (ratingHi !== "") {
                        if (isNaN(ratingHi)) {
                            console.error("Rating requires a number!");
                            return resolve(null)
                        } else {
                            filter[j++] = {"range": {"rating": {"lte": ratingHi}}};
                        }
                    }
                }

                if (priceLo !== null && priceHi !== null) {
                    if (priceLo !== "" && priceHi !== "") {
                        if (isNaN(priceLo) || isNaN(priceHi) || priceLo < 0 || priceHi < 0) {
                            console.error("Price fields require a positive number!");
                            return resolve(null)
                        } else if (priceHi < priceLo) {
                            console.error("Price lower bound was greater than upper bound!");
                            return resolve(null)
                        } else {
                            filter[j++] = {"range": {"price": {"gte": priceLo, "lte": priceHi}}};
                        }
                    } else if (priceLo !== "") {
                        if (isNaN(priceLo) || priceLo < 0) {
                            console.error("Price requires a positive number!");
                            return resolve(null)
                        } else {
                            filter[j++] = {"range": {"price": {"gte": priceLo}}};
                        }
                    } else if (priceHi !== "") {
                        if (isNaN(priceHi) || priceHi < 0) {
                            console.error("Price requires a positive number!");
                            return resolve(null)
                        } else {
                            filter[j++] = {"range": {"price": {"lte": priceHi}}};
                        }
                    }
                }
            }

            client.search({
                method: "POST",
                index: index,
                type: type,
                from: size*(page -1),
                size: size,
                defaultOperator: 'OR',
                body: {
                    "query": {
                        "bool": {
                            "must": must,
                            "filter": filter
                        }
                    }
                }
            }).then(function (body) {
                return resolve(body.hits.hits);
            });

        } else {
            return resolve(null)
        };
    });
}