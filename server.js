// server.js

"use strict";

// set up ========================
var express = require('express'),
    app = express(), 								// create our app w/ express
    PORT = 80,
    HOST = '127.0.0.1';                           // Must be the public IP where app is installed

// configuration =================

app.configure(function () {
    app.use(express.static(__dirname + '/app')); 		// set the static files location /public/img will be /img for users
    app.use(express.logger('dev')); 						// log every request to the console
    app.use(express.bodyParser()); 							// pull information from html in POST
});

// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendfile('./app/index.html');   // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.listen(PORT, HOST);
console.log("App listening on " + HOST + ":" + PORT);
