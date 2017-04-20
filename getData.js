const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    // log: 'trace'
})

module.exports = function getData(index, type, q) {

    return new Promise((resolve, reject) => {

        var must = [];
        var filter = [];

        if (!( Math.floor(q.page) === Math.ceil(q.page) && q.page > 0 )) {
            console.error("Pages are intended to be positive integers");
            return resolve();
        } else if (!( Math.floor(q.size) === Math.ceil(q.size) && q.size > 0 )) {
            console.error("Pages size are intended to be positive integers");
            return resolve();
        }

        if (q.name || q.description || q.ratingLo || q.ratingHi || q.priceLo || q.priceHi) { // if any parameter was injected

            var i = 0; // for queries array
            if (q.name !== undefined && q.name !== "") {
                must[i++] = {"match": {"name": q.name}};
            }
            if (q.description !== undefined && q.description !== "") {
                must[i++] = {"match": {"description": q.description}};
            }

            var j = 0; // for filters array
            if (q.ratingLo !== undefined && q.ratingHi !== undefined) {
                if (q.ratingLo !== "" && q.ratingHi !== "") {
                    if (isNaN(q.ratingLo) || isNaN(q.ratingHi)) {
                        console.error("Rating requires a number!");
                        return resolve()
                    } else if (q.ratingHi < q.ratingLo) {
                        console.error("Rating lower bound was greater than upper bound!");
                        return resolve()
                    } else {
                        filter[j++] = {"range": {"rating": {"gte": q.ratingLo, "lte": q.ratingHi}}};
                    }
                } else if (q.ratingLo !== "") {
                    if (isNaN(q.ratingLo)) {
                        console.error("Rating requires a number!");
                        return resolve()
                    } else {
                        filter[j++] = {"range": {"rating": {"gte": q.ratingLo}}};
                    }
                } else if (q.ratingHi !== "") {
                    if (isNaN(q.ratingHi)) {
                        console.error("Rating requires a number!");
                        return resolve()
                    } else {
                        filter[j++] = {"range": {"rating": {"lte": q.ratingHi}}};
                    }
                }
            }

            if (q.priceLo !== undefined && q.priceHi !== undefined) {
                if (q.priceLo !== "" && q.priceHi !== "") {
                    if (isNaN(q.priceLo) || isNaN(q.priceHi) || q.priceLo < 0 || q.priceHi < 0) {
                        console.error("Price fields require a positive number!");
                        return resolve()
                    } else if (q.priceHi < q.priceLo) {
                        console.error("Price lower bound was greater than upper bound!");
                        return resolve()
                    } else {
                        filter[j++] = {"range": {"price": {"gte": q.priceLo, "lte": q.priceHi}}};
                    }
                } else if (q.priceLo !== "") {
                    if (isNaN(q.priceLo) || q.priceLo < 0) {
                        console.error("Price requires a positive number!");
                        return resolve()
                    } else {
                        filter[j++] = {"range": {"price": {"gte": q.priceLo}}};
                    }
                } else if (q.priceHi !== "") {
                    if (isNaN(q.priceHi) || q.priceHi < 0) {
                        console.error("Price requires a positive number!");
                        return resolve()
                    } else {
                        filter[j++] = {"range": {"price": {"lte": q.priceHi}}};
                    }
                }
            }
        }

        client.search({
            method: "POST",
            index: index,
            type: type,
            from: q.size*(q.page -1),
            size: q.size,
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
    });
}