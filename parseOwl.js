var ParseOwl = (function() {
  function parseOwl(str) {
    var reg = new RegExp('/.*#(.+)"', "g");
    var match = null;
    var result = [];
    while ((match = reg.exec(str)) !== null) {
      console.log(match);
      result.push(match[1]);
    }
    return result.length > 0 ? result : null;
  }

  // main function of processing once files loaded [take textString of all concatinated files all together]
  function fileProccessing(text, outputDoms, callback) {
    var list = null;
    if (this.parseOwl) {
      this.parseOwl(text, this.overrideMode);
      list = this.list;
    } else {
      list = parseOwl(text); // support both in class and not in class cases
    }

    // output to one or multiple containers
    if (outputDoms) {
      // outputDoms here is an array ! important!
      outputDoms.forEach(function(ouput) {
        renderList.call(this, list, output);
      });
    }

    callback.call(this, list, text, outputDoms); // callback at end of processing
  }

  // render the result of parsing (list)
  function renderList(list, outputDom) {
    //ouput dom not array but a dom

    if (this.renderOverride) {
      // override render function
      this.renderOverride(list, outputDom);
      return;
    }
    if (outputDom) {
      var input;
      var comma;
      var str;
      var i;
      outputDom.innerHTML = "";

      for (i = 0; i < list.length - 1; i++) {
        str = list[i];
        input = document.createElement("input");
        input.setAttribute("type", "text");
        input.value = str;

        comma = document.createElement("span");
        comma.innerHTML = ",&nbsp;";
        outputDom.appendChild(input);
        outputDom.appendChild(comma);
      }

      // last one no comma
      str = list[i];
      input = document.createElement("input");
      input.setAttribute("type", "text");
      input.value = str;
      outputDom.appendChild(input);
    }
  }

  // file input select handler
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    var reader = new FileReader();
    var text = "";
    var numFilesRead = 0;

    reader.onload = function(evt) {
      text += evt.target.result + "\n";
      numFilesRead++;
      if (numFilesRead === files.length) {
        // at the last one we process
        fileProccessing.call(
          this,
          text,
          this.outputDom,
          this.onFileProccessEnd
        );
      }
    }.bind(this);

    for (let i = 0; i < files.length; i++) {
      reader.readAsText(files[i]);
    }
  }

  //  this is a class that wrap all the functionality in an easy to use api

  function ParseOwlInput(options) {
    this.list = []; // list parsed result
    this.overrideMode = true; // default to true

    Object.assign(this, options); // copy options to the instance properties

    initFileInputsAndListeners.call(this);
    initOutputDom.call(this);
  }

  // prototype func
  (function(p) {
    // render the list to a dom el (list saved in this class Object)
    p.renderList = function(outputDoms) {
      // output doms must be doms
      if (!Array.isArray(outputDoms)) {
        outputDoms = [outputDoms];
      }

      ouputDoms.forEach(
        function(output) {
          renderList.call(this, this.list, output);
        }.bind(this)
      );

      return this;
    };

    // parse manually (depend on override either override the list or concate to it)
    p.parseOwl = function(text, override) {
      var list = parseOwl(text);
      if (override) {
        this.list = list;
      } else {
        this.list = this.list.concat(list);
      }

      return list;
    };

    p.resetList = function() {
      this.list = [];
      return this;
    };

    // if needed add more functionalities ()
  })(ParseOwlInput.prototype);

  // private functions

  function initFileInputsAndListeners() {
    // file inputs option (array or one dom el or string or an array of strings)
    if (this.fileInputs) {
      if (!Array.isArray(this.fileInputs)) {
        // make sure it's an array
        this.fileInputs = [this.fileInputs];
      }

      this.fileInputs.forEach(
        function(input, index) {
          if (typeof input === "string") {
            // case a string (an ID)
            input = input.replace("#", "");
            this.fileInputs[index] = document.getElementById(input);

            this.fileInputs[index].addEventListener(
              "change",
              handleFileSelect.bind(this)
            );
          }
        }.bind(this)
      );
    }
  }

  // set and init the outputDom where to render the result of parsing
  function initOutputDom() {
    if (this.outputDom) {
      if (!Array.isArray(this.outputDom)) {
        //make sure it's an array
        this.outputDom = [this.outputDom];
      }

      this.outputDom.forEach(
        function(output, index) {
          if (typeof output === "string") {
            output = output.replace("#", "");
            this.outputDom[index] = output = document.getElementById(output);
          }
        }.bind(this)
      );
    }
  }

  return {
    parseOwl: parseOwl,
    ParseOwlInput: ParseOwlInput
  };
})();
