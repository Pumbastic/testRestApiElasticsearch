
const path = require('path');
const fs = require('fs')
const sass = require('node-sass');
sass.render({
    file: './public/styles.scss',
    outFile: './public/styles.css',
}, function(err, result) {
    if(!err){
        //console.log('No errors during the compilation, writing the result on the disk')
        fs.writeFile('./public/styles.css', result.css, function(err){
            if(!err){
                // console.log('scss compiled, file written to disc');
            } else {
                console.error(error);
            }
        });
    } else {
        console.error(error);
    }
});