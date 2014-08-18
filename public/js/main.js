

/* jshint evil: true */

var Response = function(socket) {
	this.socket = socket;
};




$(document).ready(function() {

	console.log("Loaded...");


    var editor = ace.edit("editor");
    // editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
	

	
	hljs.initHighlightingOnLoad();


	var socket = io.connect('http://httpjs.net');

	socket.emit('register', {});


	socket.on('request', function (req) {
		console.log(req);

		var reqtxt = req.method + " " + req.url + " HTTP/1.1\n";
		for(var key in req.headers) {
			reqtxt += key.charAt(0).toUpperCase() + key.slice(1) + ': ' + req.headers[key] + "\n";
		}
		reqtxt +=  "\n" + JSON.stringify(req.body, undefined, 4) + "\n";

		$('#iReq').empty().append('<pre><code class="http">' + reqtxt + '</code></pre>');

		$('#inspector').show();
		$('#banner').hide();

		$(document).ready(function() {
			$('pre code').each(function(i, block) {
				hljs.highlightBlock(block);
			});
		});

		var response = {};
		var code = editor.getSession().getValue();

		var process;
		try {
			process = function() {
				console.log("Before eval()");
				var x = eval('(function() { ' + code + '}())');
				console.log("After eval()");
				return x;
			}();
		} catch (e) {
			console.error('Error when executing script', e);
			return;
		}

		var ready = function() {
			socket.emit('response', {
				"index": req.index,
				"response": response
			});
		};

		if (typeof process !== 'function') {
			console.error('Inline javascript did not properly return an process function.');
			return;
		}

		try {
			process(req, response, ready);
		} catch (e) {
			console.error('Error when executing process function', e);
			return;
		}


	});


	socket.on('response', function (response) {

		console.log("Receiving response", response);

		var restxt = response.headers.replace('\r\n', "\n") + response.rawbody;
		$('#iRes').empty().append('<pre><code class="http">' + restxt + '</code></pre>');

		$('pre code').each(function(i, block) {
			hljs.highlightBlock(block);
		});


	});


	socket.on('registered', function (data) {
		$('#url').val(data.url);
		$('#urlcontainer').show();
		// $('#url').focus()
		// 	// .setSelectionRange(0, data.url.length)
		// 	.select();
		// window.prompt("Copy to clipboard: Cmd+C, Enter", data.url);
		//
	});



});


