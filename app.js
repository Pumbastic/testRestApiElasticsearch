'use strict';
const sass = require('./sass');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const handlebars = require('express3-handlebars')
    .create({ defaultLayout:'main' });
const elasticsearch = require('elasticsearch');
const db = require("./database");
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    // log: 'trace'
});

app.disable('x-powered-by');

app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));
app.use('/categories', require('./categories'));
app.use('/products', require('./products'));

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

client.bulk({ body:  db }, function(err, resp){});

app.get('/', function(req, res){
    res.render('home');
});

app.listen(app.get('port'), function(){
    console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
});
