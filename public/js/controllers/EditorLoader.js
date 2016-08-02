define(function(require, exports, module) {

	var EditorLoader = function(editor) {
		var that = this;
		this.editor = editor;
		this.filecontents = {
			"basic": require("text!../../templates/basic.js"),
			"ex2": require("text!../../templates/ex2.js"),
			"oauth": require("text!../../templates/oauth.js")
		};

		this.files = {
			"basic": "Basic example",
			"ex2": "More advanced example",
			"oauth": "OAuth 2.0 Server API"
		};

		for(var key in this.files) {
			$("#serverSelector").append('<option value="' + key + '">' + this.files[key] + '</option>');
		}

		

		$("#serverSelector").select2({
			 placeholder: "Load an Server API Implementation",
		}).on("select2-selecting", function(e) { 
			// console.log ("selecting val=" + e.val);
			that.load(e.val);
		});

		var loaded = this.loadInitialSavedContent();

		if (!loaded) this.load('basic');

		this.changeCounter = 0;

		this.autosaveNotBefore = (new Date()).getTime() + 1500;
		this.editor.on('change', function() {

			that.changeCounter++;

			// console.log("Editor change. Autosave in 1500 ms.");
			that.autosaveNotBefore = (new Date()).getTime() + 1500;
			setTimeout(function() {

				if (--that.changeCounter <= 0) {
					that.autosave();	
				}

			}, 1500);


		});


	    // setInterval(function() {

	    // 	that.autosave();


	    // }, 6000);
		
	};

	EditorLoader.prototype.loadInitialSavedContent = function() {
		var editorContent = localStorage.getItem("editorContent");
		if (typeof editorContent !== 'undefined' && editorContent !== null) {
			this.editor.getSession().setValue(editorContent);
			return true;
		}
		return false;
	};

	EditorLoader.prototype.autosave = function() {

		var now = (new Date()).getTime();

		if (now < this.autosaveNotBefore) {
			// console.log("Skipping autosave.. Multiple changes stacked...");
			return;
		}

		console.log("Autosave...");
		var data = this.editor.getSession().getValue();
		localStorage.setItem("editorContent", data);


	};

	EditorLoader.prototype.load = function(page) {

		if (!this.filecontents.hasOwnProperty(page)) return;
		this.editor.getSession().setValue(this.filecontents[page]);

	};


	return EditorLoader;

});