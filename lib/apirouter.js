// var util = require('util');
// var events = require("events");

var crypto = require('crypto');

function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}



var APIrouter = function() {

	var that = this;
	this.index = {};
	this.messageQueue = {};

	setInterval(function() {
		that.report();
	}, 5000);

};

APIrouter.prototype.disconnect = function(x) {
	delete this.messageQueue[x];
};

APIrouter.prototype.report = function() {

	console.log(" -------- ");
	console.log(" Indexes ["  + JSON.stringify(Object.keys(this.index)) + "]");
	console.log(" Queue   ["  + JSON.stringify(Object.keys(this.messageQueue)) + "]");

};

APIrouter.prototype.getNewIndex = function() {

	// return 'xxx';

	var i = randomValueHex(3);
	while (this.index.hasOwnProperty(i)) {
		i = randomValueHex(4);
	}
	return i;
};


APIrouter.prototype.get = function(socket) {
	var key = this.getNewIndex();
	this.index[key] = socket;
	return key;
};


APIrouter.prototype.response = function(responseMsg) {

	if  (!responseMsg.hasOwnProperty('response')) responseMsg.response = {};
	if  (!responseMsg.hasOwnProperty('index')) return;
	var msgKey = responseMsg.index;
	if (!this.messageQueue.hasOwnProperty(msgKey)) return;

	var response = responseMsg.response;

	console.log("Got this rsponse"); console.log(response);

	var msg = this.messageQueue[msgKey];

	if (response.hasOwnProperty('status')) {
		msg.res.status(response.status);
	}
	var rawbody = '';
	if (response.hasOwnProperty('body')) {
		rawbody = JSON.stringify(response.body, undefined, 1);
	}
	msg.res.setHeader('Content-Type', 'application/json; charset=utf-8');
	msg.res.send(rawbody);


	var rmsg = {
		'headers': msg.res._header,
		'rawbody': rawbody
		// 'r': msg.res
	};

	// for(var key in msg.res) {
	// 	if (!msg.res.hasOwnProperty(key)) continue;
	// 	if (typeof msg.res[key] === 'function') continue; 
	// 	if (key === 'req') continue;
	// 	if (key === 'res') continue;
	// 	if (key === 'client') continue;
	// 	if (key === 'connection') continue;
	// 	if (key === 'socket') continue;
		
	// 	console.log("Response [" + key + "]");
	// 	console.log(msg.res[key]);
	// }

	msg.socket.emit('response', rmsg);

	delete this.messageQueue[msgKey];

};

APIrouter.prototype.route = function(x, req, res) {

	var that = this;
	if (!this.index.hasOwnProperty(x)) {
		return res.status(404).send('This API host is not currently running.');
	}


	var msgKey = randomValueHex(6);
	this.messageQueue[msgKey] = {};


	var socket = this.index[x];

	// for(var key in req) {
	// 	if (!req.hasOwnProperty(key)) continue;
	// 	if (typeof req[key] === 'function') continue; 
	// 	if (key === 'req') continue;
	// 	if (key === 'res') continue;
	// 	console.log("request [" + key + "]");
	// 	console.log(req[key]);
	// }

	var msg = {
		query: req.query,
		ip: req.ip,
		host: req.host,
		body: req.body,
		path: req.path,
		url: req.url,
		headers: req.headers,
		method: req.method,
		index: msgKey
	};
	this.messageQueue[msgKey].request = msg;
	this.messageQueue[msgKey].req = req;
	this.messageQueue[msgKey].res = res;
	this.messageQueue[msgKey].socket = socket;

	setTimeout(function() {

		if (!that.messageQueue.hasOwnProperty(msgKey)) return;
		res.status(504).send(
			'Request timed out, while waiting for the flipped backend to respond.' + 
			"\n");
		delete that.messageQueue[msgKey];

	}, 3500);




	socket.emit('request', msg);

	// res.send('Hi');

};


// util.inherits(APIrouter, events.EventEmitter);

exports.APIrouter = APIrouter;


