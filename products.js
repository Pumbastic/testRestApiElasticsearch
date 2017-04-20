'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const pug = require('pug');
const template = pug.compileFile('template.pug');
const getData = require('./getData');
const Promise = require('bluebird');

router.use(bodyParser.urlencoded());

router.get('/search', function(req, res){

    if(req._parsedOriginalUrl.search) {

        Promise.resolve(getData('store', 'product', req.query)).then(function (hits) {
            if (hits) {
              //res.render('productsSearch', {data: template({data: hits})}); // backend rendering
                res.render('productsSearch', {data: hits});
            } else {
                res.render('productsSearch');
            }
        });

    } else {
        res.render('productsSearch');
    }
});

module.exports = router;
