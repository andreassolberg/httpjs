/*
 * Prototype your API. Basic example.
 */
var process = function(t) {
	
	// When requesting a favicon, return not found, and do not display.
	if (t.req.path === '/favicon.ico') 
		return t.notFound().hide().ready();

	var response = {
		"Hi": t.req.ip,
		"Thanks for contacting": t.req.host,
		"My URL is ": t.url
	};

	return t.setJSON(response).ready();
};

return process;
