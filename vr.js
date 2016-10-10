// Console Log Colors
var colors = require('colors');
var colors = require('colors/safe');
console.log(colors.green('VRCITY VR SERVER LOADING'));
// Express, Firebase, and Handlebars
var express = require('express');
console.log(colors.green('Express'));
var firebase = require('firebase');
console.log(colors.green('Firebase'));
var exphbs = require('express-handlebars');
console.log(colors.green('Express-Handlebars'));
var _ = require('underscore');
console.log(colors.green('Underscore'));
var app = express();

// Environment Variables
var config = require('./app/config.js');
if(config.envMode == 'DEV'){
    console.log(colors.green('###### DEVELOPMENT ######'));
} else if (config.envMode == 'PROD'){
    console.log(colors.green('###### PRODUCTION ######'));
} else {
    console.log(colors.green('###### NO ENVIRONMENT ######'));
}

// Express-Status-Monitor
app.use(require('express-status-monitor')());

// Initialize Firebase
if(config.envMode == 'DEV'){
    firebase.initializeApp({
      serviceAccount: {
        projectId: "vrcity-dev",
        clientEmail: "vrcity-dev@appspot.gserviceaccount.com",
        privateKey: ""
      },
      databaseURL: "https://vrcity-dev.firebaseio.com/"
    });
    console.log(colors.green('Development Database Initialized'));
} else if (config.envMode == 'PROD'){
    firebase.initializeApp({
      serviceAccount: {
        projectId: "vrcity-4fd1f",
        clientEmail: "vrcity-4fd1f@appspot.gserviceaccount.com",
        privateKey: ""
      },
      databaseURL: "https://vrcity-4fd1f.firebaseio.com/"
    });
    console.log(colors.green('Production Database Initialized'));
} else {
    console.log('Database Not Loaded (Env not DEV or PROD)');
};

// Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Connect Firebase
var db = firebase.database();
console.log(colors.green('Firebase Connected'));

////////////////////////////////////
//            REQUESTS            //
////////////////////////////////////

// GET City
app.get('/', function (req, res) {
    console.log(colors.white('Request for City'));

    // Get City Data (needs to logically pick a city)
    var dbref = db.ref("victoria");
    console.log(colors.green('City of Victoria Loading'));
    
    // Once Loaded...
    dbref.once("value", function(snapshot) {
        console.log(colors.green('City of Victoria Loaded'));
        var snapshotRef = snapshot.val();

        console.log(colors.green('Loading Resources'));
        
        // Utilities
        var util = require('./app/utilities.js');
        console.log(colors.green('Utilities Loaded'));

        // Buildings
        var buildings = require('./app/buildings.js');
        console.log(colors.green('Plots Loaded'));
        
        console.log(colors.green('All Resources Loaded'));
        
        // Sort Buildings with Underscore
        console.log(colors.green('Sorting Plots'));
        var sortedObjs = _.sortBy( snapshotRef.buildings, 'buildingNumber' );

        // Declare Buildings Array
        var buildingArray = [];
        
        // For all buildings in city
        console.log(colors.green('Pushing Buildings to Plots'));
        for(i=0;i<sortedObjs.length;i++){
            // Create buidling object
            var building = {
                xpos : String(buildings.properties[i].x),
                ypos : String(buildings.properties[i].y),
                height  : parseInt(sortedObjs[i].height),
                bldname : sortedObjs[i].buildingNameNoSpace,
                ctyname : "victoria",
                bldnum  : sortedObjs[i].buildingNumber,
                ctynum  : 1,
                adr1 : { x: (buildings.properties[i].x -4.5), y: (buildings.properties[i].y) },
                adr2 : { x: (buildings.properties[i].x), y: (buildings.properties[i].y -4.5) },
                adr3 : { x: (buildings.properties[i].x +4.5), y: (buildings.properties[i].y) },
                adr4 : { x: (buildings.properties[i].x), y: (buildings.properties[i].y +4.5) },
                wallMove : (parseInt(sortedObjs[i].height) * 1.362),
                roofMove : (((parseInt(sortedObjs[i].height) * 1.362)*2)-.1),
                wall1 : { 
                    x: (buildings.properties[i].x -4.47),
                    y: (buildings.properties[i].y),
                    img : sortedObjs[i].outerwalls.north
                },
                wall2 : { 
                    x: (buildings.properties[i].x), 
                    y: (buildings.properties[i].y -4.47), 
                    img : sortedObjs[i].outerwalls.east
                },
                wall3 : { 
                    x: (buildings.properties[i].x +4.47), 
                    y: (buildings.properties[i].y), 
                    img : sortedObjs[i].outerwalls.south
                },
                wall4 : { 
                    x: (buildings.properties[i].x), 
                    y: (buildings.properties[i].y +4.47), 
                    img : sortedObjs[i].outerwalls.west
                },
                roof : { 
                    x: (buildings.properties[i].x), 
                    y: (buildings.properties[i].y), 
                    img : sortedObjs[i].outerwalls.roof
                },
                door : sortedObjs[i].outerwalls.door,
                portal1 : {
                    x: (buildings.properties[i].x -4.48),
                    y: (buildings.properties[i].y)
                },
                portal2 : {
                    x: (buildings.properties[i].x),
                    y: (buildings.properties[i].y -4.48)
                },
                portal3 : {
                    x: (buildings.properties[i].x +4.48),
                    y: (buildings.properties[i].y)
                },
                portal4 : {
                    x: (buildings.properties[i].x),
                    y: (buildings.properties[i].y +4.48)
                }
            };
            // Push to building array
            buildingArray.push(building);
        }; // End for loop
        
        console.log(colors.green('Plots Filled'));

    // Render Page
    console.log(colors.green('Rendering Content'));
    res.render('vr-city', {building:buildingArray, envMode:config.envMode, envServer:config.envServer, layout:'vr'
       }, function(err, html) {
            res.send(html);
    });

    console.log(colors.green('City Request Fulfilled'));

    }); // End Database Once

}); // End City Get

// GET Building
app.get('/city/:cityName/building/:buildingName/:dir', function (req, res) {
    console.log(colors.green('Request for Building (' +req.params.dir +' entrance)'));
    // Route Params
    var cityName = req.params.cityName;
    var buildingName = req.params.buildingName;
    var entranceDir = req.params.dir;
    
//    if(entranceDir){};
    
    // Database Reference
    var bldref = db.ref(String(cityName +"/buildings/" +buildingName));
    // Once Loaded...
    bldref.once("value", function(snapshot) {
        console.log(colors.green('buildingName +" loaded"'));
        var bld = snapshot.val();
        // Render Page
        res.render('vr-building', {bld:bld, entranceDir:entranceDir, envMode:config.envMode, envServer:config.envServer, layout:'vr', function(err, html) {
            res.send(html);
        }});
    });  
}); 
// End Building Get

////////////////////////////////////
//          Launch App            //
////////////////////////////////////

// Serve Public Files
app.use('/serve', express.static('serve'));

// Start App
app.listen(8080, function () {
    console.log(colors.green(config.envMode +' server at ' +config.envServer +':8080'));
});

console.log(colors.green('VRCITY VR ' +config.envMode +' SERVER LOADED'));
