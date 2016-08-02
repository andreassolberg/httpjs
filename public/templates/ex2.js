/*
 * Prototype your API. Basic example.
 */
var process = function(t) {
	
	console.log("We received this request", t.req);
	
	// When requesting a favicon
	if (t.req.path === '/favicon.ico') 
		return t.notFound()
			.hide()		// Do not display the request entry
			.ready();	// Done, return the response.

	var response = {
		"Hi": t.req.ip, 		// We may access the IP Adress of the request.
		"Thanks for contacting": t.req.host,	// the hostname of the server
		"My URL is ": t.url 					// the full URL of the base API
	};

	// If the request contains a 'user' property in the request body
	if (t.req.body.user) {
		response.user = t.req.body.user;

		if (t.req.body.user === 'Guest')
			return t.setStatus(500).setBody('Internal error', 'text/plain').ready();
	}

	console.log("Query string parameters in request", t.req.query);

	// Now return the response as a JSON object.
	return t.setJSON(response).ready();
};

return process;
