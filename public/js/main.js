/* jshint evil: true */

require.config({
    baseUrl: "js",
    paths: {
        "bower": "../bower_components",
        "text": "../bower_components/requirejs-text/text"
    }
});

define(function(require, exports, module) {

	var OutputController = require('controllers/OutputController');
	var Output = require('models/Output');
	var EditorLoader = require('controllers/EditorLoader');
	var Transaction = require('models/Transaction');

	var Session = function() {

	};


	var session = new Session();



	var App = function() {

	};


	var app = new App();


	var messages = {};



	var Response = function(socket) {
		this.socket = socket;
	};




$(document).ready(function() {

	console.log("Loaded...");



    var editor = ace.edit("editor");
    // editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    editor.$blockScrolling = "Infinity";

	var eloader = new EditorLoader(editor);

    var out = new OutputController($("#inspector"));

	var hostKey = null;
	var serverURL = null;



    $(".resetBtn").on('click', function(e) {
    	e.stopPropagation(); e.preventDefault();
    	localStorage.removeItem("hostKey");
    	localStorage.removeItem("editorContent");
    	location.reload();
    });


	hljs.initHighlightingOnLoad();

	var socket = io.connect('https://httpjs.net');


	socket.on('disconnect', function() {

		$("#disconnected").show();
		console.error("Discconnected");

		$("#statusLabel").removeClass("label-sucess").addClass("label-danger").empty().append('Not connected');

	});


	setInterval(function() {
		if (hostKey !== null) {
			socket.emit('ping', {});
		}
	}, 5000);

	var storedHostKey = localStorage.getItem("hostKey");


	var registermsg = {};
	if (typeof storedHostKey !== 'undefined' && storedHostKey !== null) {
		registermsg.hostKey = storedHostKey;
	}

	socket.emit('register', registermsg);


	socket.on('request', function (req) {
		console.log("Incomming request", req);




	    // out.addOutput(new Output(req, {"res": 1}));

		$('#inspector').show();
		$('.hideOnStart').hide();

		$(document).ready(function() {
			$('pre code').each(function(i, block) {
				hljs.highlightBlock(block);
			});
		});

		var code = editor.getSession().getValue();

		var process;
		try {
			process = function() {
				// console.log("Before eval()");
				var x = eval('(function() { ' + code + '}())');
				// console.log("After eval()");
				return x;
			}();
		} catch (e) {
			console.error('Error when executing script', e);
			return;
		}

		var ready = function(t) {
			// console.log("CALLBACK CALLED");
			if (!t.hasOwnProperty('req')) throw new Error('Corrupt transaction object.');
			if (!t.hasOwnProperty('res')) throw new Error('Corrupt transaction object.');
			if (!t.req.hasOwnProperty('index')) throw new Error('Corrupt transaction object.');
			// console.log("Response ready. We got " , t);
			socket.emit('response', {
				"index": t.req.index,
				"response": t.res
			});
		};

		if (typeof process !== 'function') {
			console.error('Inline javascript did not properly return an process function.');
			return;
		}

		// console.log("About to setup transaction and run ", process);

		var transaction = new Transaction(req, ready);
		transaction.url = serverURL;

		messages[req.index] = transaction;

		try {
			process(transaction);
		} catch (e) {
			console.error('Error when executing process function', e);
			return;
		}
		// console.log("DONE");

	});


	socket.on('response', function (response) {

		// console.log("Receiving response", response);

		var request = null;
		var show = true;
		if (messages.hasOwnProperty(response.index)) {
			request = messages[response.index].req;
			show = messages[response.index].display;
			delete messages[response.index];
		}
		if (show) {
			out.addOutput(new Output(request, response));
		}

	});


	socket.on('registered', function (data) {

		localStorage.setItem("hostKey", data.hostKey);
		hostKey = data.hostKey;

		serverURL = data.url;

		$('#url').val(data.url);
		$('#urlcontainer').show();

		$(".insertHost").empty().append(data.url);
		// $('#url').focus()
		// 	// .setSelectionRange(0, data.url.length)
		// 	.select();
		// window.prompt("Copy to clipboard: Cmd+C, Enter", data.url);
		//
	});



});

});
