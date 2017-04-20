'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const pug = require('pug');
const template = pug.compileFile('template.pug');
const getData = require('./getData');
const Promise = require('bluebird');

router.use(bodyParser.urlencoded());

router.get('/', function(req, res){
    res.render('categories');
});

router.get('/search', function(req, res){

    if(req._parsedOriginalUrl.search) {

        Promise.resolve(getData('store', 'category', req.query)).then(function (hits) {
            if (hits) {
                res.render('categoriesSearch', {data: template({data: hits})});
            } else {
                res.render('categoriesSearch');
            }
        });

    } else {
        res.render('categoriesSearch');
    }
});

module.exports = router;