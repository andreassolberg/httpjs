define(function(require, exports, module) {

	function isEmpty(obj) {
		for(var prop in obj) {
		if(obj.hasOwnProperty(prop))
			return false;
		}
		return true;
	}

	var Output = require('../models/Output');

	var OutputController = function(container) {

		var that = this;
		this.container = container;
		this.entries = {};
		this.current = null;

		$('#outputindex').on('click', 'a.list-group-item', function(e) {
			e.stopPropagation(); e.preventDefault();

			var x = $(e.currentTarget).data('oid');
			// console.log("Selected", x);
			that.select(x);

		});

		setInterval($.proxy(this.updateTiming, this), 1000);

	};

	OutputController.prototype.cleanUp = function() {

		var that = this, c = 0;
		// console.log("Update timing...");
		$('#outputindex').find('a.list-group-item').each(function(i, item) {

			var oid = $(item).data('oid');
			if (c++ > 10) {
				$(item).remove();
				delete that.entries[oid];
			}

		});
	};

	OutputController.prototype.updateTiming = function() {
		var that = this;
		this.cleanUp();
		$('#outputindex').find('a.list-group-item').each(function(i, item) {

			var oid = $(item).data('oid');
			// console.log("Processing time for ", oid, that.entries[oid].getTime());
			if (!that.entries[oid]) return;

			$(item).empty().append(that.entries[oid].getListTopic());

		});


	};


	OutputController.prototype.select = function(input) {
		var id = null;
		if (input instanceof Output) {
			id = input.id;
		} else {
			id = input;
		}

		if (this.entries.hasOwnProperty(id) && this.current !== id) {
			this.current = id;
			$('#outputindex').find('a.list-group-item').each(function(i, item) {
				if ($(item).data('oid') === id) {
					$(item).addClass('active');
				} else {
					$(item).removeClass('active');
				}
			});

		}

		this.draw(this.entries[id]);

	};

	OutputController.prototype.draw = function(entry) {

		// console.log("Adding output", entry);
		// console.log("Adding output", entry);

		var reqtxt = entry.getReqTxt();
		var restxt = entry.getResTxt();

		$('#iReq').empty().append('<pre><code class="http">' + reqtxt + '</code></pre>');
		$('#iRes').empty().append('<pre><code class="http">' + restxt + '</code></pre>');

		if (entry.hasParsedBody()) {
			// console.log("Has body", entry.getReqBody());
			$('#iBodyContent').empty().append('<pre><code class="json">' + entry.getReqBody() + '</code></pre>').show();
			$('#iBody').show();

		} else {
			$('#iBody').hide();
		}

		$('pre code').each(function(i, block) {
			hljs.highlightBlock(block);
		});


	};

	OutputController.prototype.addOutput = function(entry) {
		if (!entry instanceof Output) throw new Error('Adding output MUST be of the Output type.');

		$('#outputindex').prepend(
				'<a href="#" data-oid="' + entry.id + '" class="list-group-item">' + 
					entry.getListTopic() + 
				'</a>');


		this.entries[entry.id] = entry;

		this.select(entry.id);

	};

	return OutputController;

});