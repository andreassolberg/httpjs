
var config = {
	"client_id": "testclient",
	"secret": "secret123"
};

// Helper object, to represent the OAuth Server.
var OAuth = function() {

	if (!window.oauthCodes) window.oauthCodes = {};
	if (!window.oauthTokens) window.oauthTokens = {};

};

OAuth.prototype.uuid = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
};

OAuth.prototype.getCode = function(client_id, redirect_uri) {
	var code = this.uuid();
	var token = {
		"access_token": this.uuid(),
		"expires_in": 3600
	};
	window.oauthCodes[code] = {
		"token": token,
		"redirect_uri": redirect_uri
	};
	return code;
};

OAuth.prototype.getToken = function(code) {
	if (window.oauthCodes[code]) {
		return window.oauthCodes[code];
	}
	return null;
};


function buildQS(parameters){
	var qsa = [];
	for(var key in parameters) {
		var value = parameters[key];
		qsa.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
	}
	return qsa.join('&');
}



/*
 * OAuth 2.0 Server implementation
 * Notice that this is only intended for testing purposes of OAuth clients.
 */
var process = function(t) {
	
	console.log("We received this request", t.req);

	oauth = new OAuth();
	
	if (t.req.path === '/info') {
		return t.setJSON({
			'redirect_uri': t.url + '/authorization',
			'token': t.url + '/token'
		}).ready();
	}


	if (t.req.path === '/authorization') {

		if (!t.req.query.response_type) return t.error('Missing required parameter response_type').ready();
		if (t.req.query.response_type !== 'code') return t.error('Only response_type code implemented. Sorry.').ready();
		if (config.client_id !== t.req.query.client_id)  return t.error('Invalid client_id').ready();

		if (!t.req.query.redirect_uri)  return t.error('Redurect URI Missing in authorization request').ready();

		var authresponse = {};

		var state = null;
		if (t.req.query.state) {
			state = t.req.query.state;
			authresponse.state = state;
		}
		var code = oauth.getCode(t.req.query.client_id, t.req.query.redirect_uri);
		authresponse.code = code;
		var url = t.req.query.redirect_uri + '?' + buildQS(authresponse);
		console.log("redirecting to url " + url);

		return t.redirect(url).ready();
		
	}

	if (t.req.path === '/token') {

		if (!t.req.body.grant_type) return t.error('Missing required parameter grant_type').ready();
		if (t.req.body.grant_type !== 'authorization_code') return t.error('Only grant type authorization_code implemented. Sorry.').ready();
		if (!t.req.body.code) return t.error('Missing required parameter code').ready();
		if (!t.req.body.redirect_uri) return t.error('Missing required parameter redirect_uri').ready();
		if (!t.req.body.client_id) return t.error('Missing required parameter client_id').ready();

		if (!t.req.headers.hasOwnProperty('authorization')) return t.error('Missing authorization header').ready();
		if (!t.req.auth) return t.error('Unauthenticated').ready();
		if (t.req.auth.username !== config.client_id) return t.error('Wrong username').ready();
		if (t.req.auth.password !== config.secret) return t.error('Wrong password').ready();
		if (t.req.auth.username !== t.req.body.client_id) return t.error('Authenticated with wrong client compared to the request').ready();

		var data = oauth.getToken(t.req.body.code);
		if (data === null) return t.error('Could not find token').ready();
		if (data.redirect_uri !== t.req.body.redirect_uri) return t.error('Invalid redirect_uri. Not same as used in the authorization request').ready();
		var token = data.token;
		// var token = {};
		return t.setJSON(token).ready();
	}


	return t.notFound().ready();


};

return process;
