var express = require('express');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
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





var port = nconf.get('http:port');
var host = nconf.get('http:host');
var baseURL = '.' + host; 
console.log("Setting up server to listen at port " + port);
server.listen(port);

var ar = new APIrouter();

function getX(host) {

	var i = host.indexOf(baseURL);
	// if (i === -1) return null;
	if (i < 1) return null;

	var sub = host.substring(0, i);
	return sub;
}


app.use(function(req, res, next) {
	if (req.host !== host) return next();
	return express.static(__dirname + '/public')(req, res, next);
});


app.use(bodyParser.json());
app.use(function(req, res, next) {

	var x = getX(req.host);
	var msg = {
		query: req.query,
		ip: req.ip,
		host: req.host,
		body: req.body,
		path: req.path,
		url: req.url,
		headers: req.headers,
		x: x
	};

	for(var key in req) {
		// console.log("request key " + key);
	}

	if (!x) return next();
	ar.route(x, req, res);

	// res.send(msg);

});


io.on('diconnection', function(socket) {
	console.log("Disconnected");
});

io.on('connection', function (socket) {

	var x = ar.get(socket);

	setInterval(function() {
		socket.emit('ping', { hello: x });
	}, 5000);

	socket.on('register', function (data) {
		console.log("frontend ponged back"); console.log(data);
		socket.emit('registered', {
			url: 'http://' + x + baseURL
		});
	});
	
	socket.on('response', function (msg) {
		console.log("frontend responded back"); console.log(msg);
		ar.response(msg);

	});

	socket.on('disconnect', function (x) {
		ar.disconnect();
	});

});


