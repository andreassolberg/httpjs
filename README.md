httpjs
======

An API prototyping tool running in your browser



## Building and running


```

```


----

First, client establishes a websockets connection with the backend:

	var socket = io.connect('http://httpjs.net');

Then emits a `register` message to the backend:

	socket.emit('register', {});

----

The backend, when receives a `register` message, returns with a `registered` response:

	socket.emit('registered', {
		url: 'http://' + x + baseURL
	});

----

When the backend receives an incoming HTTP Request on `http://xxx.httpjs.net`, the backend is emitting a `request` message to the frontend:


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
	var msgKey = randomValueHex(6);
	this.messageQueue[msgKey] = {};
	this.messageQueue[msgKey].request = msg;
	this.messageQueue[msgKey].req = req;
	this.messageQueue[msgKey].res = res;
	this.messageQueue[msgKey].socket = socket;

	socket.emit('request', msg);

----

When the frontend receives an `request` message, it routes it runs the `process(req, response, ready)` function from the editor. When the process function calls the `ready()` callback, the frontend, sends back the a `response message`.

	socket.emit('response', {
		"index": req.index,
		"response": response
	});

----


When the backend receives the `response` message it sends a response back to the client, and emits a `response` message back to the frontend:



	var rmsg = {
		'headers': msg.res._header,
		'rawbody': rawbody,
		'index': msgKey
		// 'r': msg.res
	};
	msg.socket.emit('response', rmsg);
