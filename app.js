"use strict";

var fs = require('fs');

var http = require('http');
var https = require('https');
var express = require('express');
var constants = require('constants');


var app = express();
var httpapp = express();


var nconf = require('nconf');

var bodyParser = require('body-parser');

var APIrouter = require('./lib/apirouter').APIrouter;




// First consider commandline arguments and environment variables, respectively.
nconf.argv().env();

// Then load configuration from a designated file.
nconf.file({ file: 'etc/config.js' });

// Provide default values for settings not provided above.
nconf.defaults({
    'http': {
        'port': 80,
        'host': 'httpjs.net'
    }
});





var privateKey  = fs.readFileSync('etc/httpjs.pem', 'utf8');
var certificate = fs.readFileSync('etc/httpjs.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
credentials.secureProtocol = 'SSLv23_method';
credentials.secureOptions = constants.SSL_OP_NO_SSLv3;


var server = http.createServer(httpapp);
var httpsServer = https.createServer(credentials, app);
var io = require('socket.io')(httpsServer);

var port = nconf.get('http:port');
var host = nconf.get('http:host');
var baseURL = '.' + host; 
console.log("Setting up server to listen at port " + port);
server.listen(port);

httpsServer.listen(443);




httpapp.use(function(req,res,next) {
  if (!/https/.test(req.protocol)){
     res.redirect(301, "https://" + req.headers.host + req.url);
  } else {
     return next();
  } 
});





var ar = new APIrouter();

function getX(host) {

	var i = host.indexOf(baseURL);
	// if (i === -1) return null;
	if (i < 1) {
		return null;
	}

	var sub = host.substring(0, i);
	return sub;
}


app.use(function(req, res, next) {
	if (req.host !== host) {
		return next();
	}
	return express.static(__dirname + '/public')(req, res, next);
});

app.use(bodyParser.urlencoded({ "extended": false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
	req.rawBody = '';

	req.on('data', function(chunk) { 
		req.rawBody += chunk;
	});

	// setTimeout(function() {
		next();	
	// }, 10);
	
});

app.use(function(req, res, next) {

	var x = getX(req.host);
	if (!x) {
		return next();
	}
	ar.route(x, req, res);

});


// io.on('disconnect', function(socket) {
// 	console.log("Disconnected");
// 	if (socket.hasOwnProperty('x')) {
// 		console.log("Disconnected; " + x);
// 	}
// });

io.on('connection', function (socket) {

	var x = null;

	setInterval(function() {
		socket.emit('ping', { hello: x });
	}, 5000);

	socket.on('ping', function() {

		if (x !== null) {
			ar.ping(x);	
		}
	});

	socket.on('register', function (data) {

		if (data.hasOwnProperty('hostKey')) {
			x = ar.get(socket, data.hostKey);
		} else {
			x = ar.get(socket);
		}
		socket.x = x;
		console.log("Frontend initiated a requeset for registration", data);
		socket.emit('registered', {
			"url": 'https://' + x + baseURL + '/',
			"hostKey": x
		});
		console.log("Successfully registered as " + x);
	});
	
	socket.on('response', function (msg) {
		console.log("frontend responded back"); console.log(msg);
		ar.response(msg);

	});

	socket.on('disconnect', function () {
		console.log("Disconnect (" + x + ")");
		ar.disconnect(x);
	});

});


