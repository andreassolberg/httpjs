define(function(require, exports, module) {


	var Transaction = function(req, c) {

		this.display = true;

		this.req = req;
		this.res = {
			"headers": {},
			"body": null
		};

		if (typeof c !== 'function') throw new Error("onReady() must be passed a function as a callback");
		this.callback = c;

	};

	// Transaction.prototype.show = function() {
	// 	this.display = true;
	// 	return this;
	// };

	Transaction.prototype.hide = function() {
		this.display = false;
		return this;
	};

	Transaction.prototype.ready = function() {
		if (typeof this.callback !== 'function') {
			throw new Error("The Transaction object has not defined an onReady(callback) event, which is required");
		}
		// console.log("Ready() About to do callback()");
		this.callback(this);
		return this;
	};

	Transaction.prototype.error = function(msg) {
		var body = '<!DOCTYPE html>' +
			'<html><head><title>Error</title></head><body>' +
			'<p>' + msg + '</p></body></html>';
		this.setStatus(500);
		this.setBody(body, 'text/html; charset=utf-8');
		return this;
	};

	Transaction.prototype.notFound = function() {
		var body = '<!DOCTYPE html>' +
			'<html><head><title>404 Not found</title></head><body>' +
			'<p>We did not find your requested page.</p></body></html>';
		this.setStatus(404);
		this.setBody(body, 'text/html; charset=utf-8');
		return this;
	};

	Transaction.prototype.setBody = function(body, type) {

		if (typeof type !== 'undefined') {
			this.setHeader('Content-Type', type);
		}
		this.res.rawbody = body;
		return this;
	};



	Transaction.prototype.setJSON = function(body) {
		this.setHeader('Content-Type', 'application/json; charset=utf-8');
		this.res.rawbody = JSON.stringify(body, undefined, 2);
		return this;
	};


	Transaction.prototype.setStatus = function(code) {
		this.res.status = code;
		return this;
	};

	Transaction.prototype.redirect = function(url) {
		var body = '<!DOCTYPE html>' +
			'<html><head><title>Redirect</title></head><body>' +
			'<p>You will be redirect to <a href="' + url + '">' +  url + '</a></p></body></html>';
		this.setStatus(302);
		this.setHeader('Location', url);
		this.setHeader('Content-Type', 'text/html; charset=utf-8');
		this.setBody(body);
		return this;
	};


	Transaction.prototype.setHeader = function(key, val) {
		this.res.headers[key] = val;
		return this;
	};



	return Transaction;
});