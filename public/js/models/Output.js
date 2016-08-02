define(function(require, exports, module) {


	var moment = require('bower/momentjs/moment');

	// console.log("M", m);


	var Output = function(request, response) {

		// console.log("moment", moment);
		this.datetime = moment();
		this.request = request;
		this.response = response;

		this.id = (Math.random() + 1).toString(36).substring(7);

	};

	Output.prototype.getTime = function() {
		var now = moment();
		var secs = now.diff(this.datetime, 'seconds');
		if (secs < 2) return 'Just now';
		if (secs < 60) return secs + ' secs ago';
		return this.datetime.fromNow();
	};

	Output.prototype.getReqHead = function() {
		var maxlen = 32;
		var str = (this.request.method + " " + this.request.url);
		if (str.length > maxlen) {
			return str.substring(0, maxlen) + '...';
		}
		return str;
	};

	Output.prototype.getListTopic = function() {
		var now = moment();
		var secs = now.diff(this.datetime, 'seconds');
		var type = (secs > 5 ? 'danger'
				: (secs > 2 ? 'warning' : 'success')
			);
			
		return this.getReqHead() + ' <span class="label label-' + type + ' pull-right">' + 
			this.getTime() + '</span>';
	};

	Output.prototype.getReqTxt = function() {

		var reqtxt = this.request.method + " " + this.request.url + " HTTP/1.1\n";
		for(var key in this.request.headers) {
			reqtxt += key.charAt(0).toUpperCase() + key.slice(1) + ': ' + this.request.headers[key] + "\n";
		}
		// reqtxt += 'Body type ' + (typeof this.request.body) + "\n";
		if (this.request.rawBody !== '') {
			reqtxt +=  "\n" + this.request.rawBody + "\n";	
		}
		return reqtxt;
	};

	Output.prototype.hasParsedBody = function() {
	    for(var prop in this.request.body) {
	        if(this.request.body.hasOwnProperty(prop))
	            return true;
	    }
	    return false;
	};


	Output.prototype.getReqBody = function() {
		return JSON.stringify(this.request.body, undefined, 4);
	};


	Output.prototype.getResTxt = function() {

		var restxt = '';

		if (this.response && this.response.headers) {
			restxt += this.response.headers.replace('\r\n', "\n");
		}
		if (this.response && this.response.rawbody ) {
			restxt += this.response.rawbody;
		}

		return restxt;

	};

	return Output;

});