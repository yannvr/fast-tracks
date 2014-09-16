var express = require('express'),
    mongo

"use strict";

// set up ========================
var express = require('express'),
    app = express(),
    mongo = require('mongodb').MongoClient,
    format = require('util').format;    // create our app w/ express
    PORT = 8080,
    MONGO_DB = 'mongodb://127.0.0.1:27017/fast-tracks',
    HOST = '192.168.1.66';                           // Must be the public IP where app is installed

// configuration =================

app.configure(function () {
    app.use(express.static(__dirname + '/app')); 		// set the static files location /public/img will be /img for users
    app.use(express.logger('dev')); 						// log every request to the console
    app.use(express.bodyParser()); 							// pull information from html in POST
});

app.get('/storeTrack', function (req, res) {
    //console.log(admin.mountpath); // /admin
    if(!(req.query.track && req.query.uid)) {
        return res.status(500).send("Missing params");
    }
    mongo.connect(MONGO_DB, function(err, db) {
        if(err) throw err;
    var collection = db.collection('fast-tracks');
        collection.insert({track:req.query.track, uid: req.query.uid}, function(err, docs) {

            collection.count(function(err, count) {
            console.log(format("count = %s", count));
        });

        // Locate all the entries using find
            collection.find().toArray(function(err, results) {
            console.dir(results);
            // Let's close the mongo
            db.close();
        });
    });
    });

    res.status(200).send('track added for user ' + req.query.uid);
});


// application -------------------------------------------------------------
app.get('/', function (req, res) {
    res.sendfile('./app/index.html');   // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.listen(PORT, HOST);
console.log("App listening on " + HOST + ":" + PORT);
