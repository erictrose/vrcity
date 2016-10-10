//Console Log Colors
var colors = require('colors');
var colors = require('colors/safe');
console.log(colors.red('VRCITY WEB SERVER LOADING'));
// Express, Firebase, and Handlebars
var express = require('express');
console.log(colors.red('Express'));
var firebase = require('firebase');
console.log(colors.red('Firebase'));
var exphbs = require('express-handlebars');
console.log(colors.red('Express-Handlebars'));
var _ = require('underscore');
console.log(colors.red('Underscore'));
var app = express();

// Environment Variables
var config = require('./app/config.js');
if(config.envMode == 'DEV'){
    console.log(colors.red('###### DEVELOPMENT ######'));
} else if (config.envMode == 'PROD'){
    console.log(colors.red('###### PRODUCTION ######'));
} else {
    console.log(colors.red('###### NO ENVIRONMENT ######'));
}

// Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// GET Root
app.get('/', function (req, res) {
    console.log(colors.white('Request for Root'));
    
    res.render('web-cities', { layout: 'web', function(err, html) {
        res.send(html);
    }});
    
    console.log(colors.red('Request for Root Fulfilled'));
}); // End / Get

// Serve Public Files
app.use('/serve', express.static('serve'));

// Start App
app.listen(80, function () {
    console.log(colors.red(config.envMode +' server at ' +config.envServer +':80'));
});

console.log(colors.red('VRCITY WEB ' +config.envMode +' SERVER LOADED'));
