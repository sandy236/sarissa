/*
 * ====================================================================
 * About Sarissa: http://dev.abiss.gr/sarissa
 * ====================================================================
 * Sarissa is an ECMAScript library acting as a cross-browser wrapper for native XML APIs.
 * The library supports Gecko based browsers like Mozilla and Firefox,
 * Internet Explorer (5.5+ with MSXML3.0+), Konqueror, Safari and Opera
 * This file, sarissa-wax.js, provides a JS implementation of the Writing 
 * API for XML (aka WAX). You can find more about WAX at
 * http://www.ociweb.com/mark/programming/WAX.html
 * @version ${project.version}
 * @author: Copyright 2004-2008 Emmanouil Batsis, mailto: mbatsis at users full stop sourceforge full stop net
 * ====================================================================
 * Licence
 * ====================================================================
 * Sarissa is free software distributed under the GNU GPL version 2 (see <a href="gpl.txt">gpl.txt</a>) or higher, 
 * GNU LGPL version 2.1 (see <a href="lgpl.txt">lgpl.txt</a>) or higher and Apache Software License 2.0 or higher 
 * (see <a href="asl.txt">asl.txt</a>). This means you can choose one of the three and use that if you like. If 
 * you make modifications under the ASL, i would appreciate it if you submitted those.
 * In case your copy of Sarissa does not include the license texts, you may find
 * them online in various formats at <a href="http://www.gnu.org">http://www.gnu.org</a> and 
 * <a href="http://www.apache.org">http://www.apache.org</a>.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY 
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
 * WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE 
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * <p> Creates a WAX implementation instance.</p>
 * @constructor
 * @static
 * @param {String} s Optional: the string to write the XML into.
 */
 function WAX(s){
 	this.xml = s ? s : "";
 	this.indent = " ";
 	this.depth = 0;
 	this.trust = false;
 	this.closeStack = [];
 	this.namespaces = [];
 	this.namespaces["xml"] = "http://www.w3.org/XML/1998/namespace";
 	this.namespaces["xmlns"] = "http://www.w3.org/2000/xmlns/";
 	this.startTagNamespaces = [];
 	this.context =  WAX.CONTEXT_EMPTY_DOCUMENT;
 }
 /** @private */
 WAX.CONTEXT_EMPTY_DOCUMENT = 0;
 /** @private */
 WAX.CONTEXT_NONEMPTY_DOCUMENT = 10;
 /** @private */
 WAX.CONTEXT_PROLOGED_DOCUMENT = 20;
 /** @private */
 WAX.CONTEXT_DOCTYPED_DOCUMENT = 30;
 /** @private */
 WAX.CONTEXT_ROOTED_DOCUMENT = 40;
 /** @private */
 WAX.CONTEXT_START_TAG = 50;
 /** @private */
 WAX.CONTEXT_MIXED_CONTENT = 60;
 
 /** @private TODO */
 WAX.validateNameToken(prefix) {
 	if(prefix.toLowerCase().indexOf("xml") == 0){
 		throw "A name token cannot start with 'XML'";
 	}
};
 /** @private */
WAX.prototype.closeStartTagIfOpen = function(bSkipNewLine){
	if(this.context ==  WAX.CONTEXT_START_TAG){
		this.this.xml += ">" 
		this.context =  WAX.CONTEXT_MIXED_CONTENT;
		// check if prefixes used are in scope
		for(var i=0; i < this.startTagNamespaces.length; i++){
			if(!this.namespaces[this.startTagNamespaces[i]]){
				throw "WAX: Cannot use undeclared namespace prefix: " + this.startTagNamespaces[i];
			}
		}
		this.startTagNamespaces = [];
	}
	if(!bSkipNewLine){
		this.blankLine();
	}
};
/** @private */
WAX.prototype.dontThinkEmpty = function(){
	if(this.context ==  WAX.CONTEXT_EMPTY_DOCUMENT){
		this.context =  WAX.CONTEXT_NONEMPTY_DOCUMENT;
	}
};

/**
 * @private
 */
WAX.prototype.ensureOpen = function(){
	if(this.context ==  WAX.CONTEXT_CLOSED){
		throw "WAX: This instance is already closed"
	}
};

/**
 * Enable/disable "trust me" mode.
 * @param {boolean} bTrustMe True to turn it on, false to turn it off.
 * @return {WAX} this WAX instance
 * 
 */
WAX.prototype.setTrustMe = function(bTrustMe){
	this.trust = bTrustMe;
	return this;
};

/**
 * Gets whether "trust me" mode is enabled.
 */
WAX.prototype.isTrustMe = function(){
	return this.trust;
};

 
/**
 * Write an attribute for the currently open element start tag. The value will be escaped.
 * @param {String} prefix the namespace prefix for the attribute
 * @param {String} name the attribute name 
 * @param {Object} value the attribute value object. It will be converted to a String and 
 * the characters &, <, > and " will be escaped to their entity equivalents.
 * @param {boolean} bNewLine true to write on a new line for readability; false otherwise. Default is false.
 * @return {WAX} this WAX instance
 */
WAX.prototype.attr = function(prefix, name, value, newLine){
	this.ensureOpen();
	if(this.context !=  WAX.CONTEXT_START_TAG){
		throw "WAX: Cannot add an attribute or namespace in this context. " +
			"Given prefix: " + prefix +
			", name: " + name +
			", value: " + value;
	}
	if(bNewLine){
		this.blankLine();
	}
	else{
		this.xml += " ";
	}
	if(prefix){
		this.xml += prefix + ":";
		this.startTagNamespaces.push(prefix);
	}
	this.xml += "\"" + value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + "\"";
	return this;
};

/**
 * Writes a namespace declaration in the start tag of the current element.
 * @param prefix {String} the namespace prefix to use. If null or empty, a default namespace will be added.
 * @param uri {String} the namespace URI to use.
 * @param {boolean} bNewLine true to write on a new line for readability; false otherwise. Default is false.
 */
WAX.prototype.namespace = function(prefix, uri, bNewLine){
	if(prefix){
		this.attr("xmlns", prefix, uri, bNewLine);
		this.namespaces["prefix"] = uri;
	}
	else{
		this.attr(null, "xmlns", uri, bNewLine);
		this.namespaces["xmlns"] = uri;
	}
	return this;
};
        
/**
 * Set the indentation characters being used.
 * @param {Object} num the number of indentation spaces to use (x depth). 
 * If num is not a number, the length of it's string representation will be used instead  
 */
WAX.prototype.setIndent = function(num){
	this.indent = "";
	if(isNaN(num)){
		num = num.length;
	}
	for(var i=0;i < num; i++){
		this.indent += " ";
	}
};
        
/**
 * Get the indentation characters being used.
 * @return {integer} the number of indentation spaces being used
 */
WAX.prototype.getIndent = function(){
	return this.indent;
};

/**
 * Writes a blank line to increase readability of the XML.
 * @return {WAX} this WAX instance
 */
WAX.prototype.blankLine = function(){
	this.ensureOpen();
	this.xml += "\n";
	for(var i=0;i <= this.depth;i++){
		 this.xml += this.indent;
	}
	return this;
};


/**
 * Writes a CDATA section in the content of the current element.
 * @param {String} text the text string to write (unescaped) within the CDATA section
 * @return {WAX} this WAX instance
 */
WAX.prototype.cdata = function(text){
	this.ensureOpen();
	if(this.context < WAX.CONTEXT_ROOTED_DOCUMENT){
		throw "WAX: Cannot write CDATA section in this context";
	}
	this.closeStartTagIfOpen();
	this.xml += "<![CDATA[" + text + "]]>";
	return this;
};

/**
 * Writes a CDATA section in the content of the current element.
 * @param {String} text the text string to write (unescaped) within the CDATA section
 * @return {WAX} this WAX instance
 */
WAX.prototype.comment = function(text){
	this.ensureOpen();
	this.closeStartTagIfOpen();
	if(text.indexOf("--") != -1){
		throw "WAX: Comments cannot contain '--'";
	}
	this.xml += "<!--" + text + "-->";
	this.dontThinkEmpty();
	return this;
};

/**
 * Writes text as content of the current element
 * @param {String} text the text string to write. The text will be escaped.
 * @return {WAX} this WAX instance
 */
WAX.prototype.text = function(text, bNewline, bEscape){
	this.ensureOpen();
	if(this.context < WAX.CONTEXT_ROOTED_DOCUMENT){
		throw "WAX: Cannot write text in this context";
	}
	this.closeStartTagIfOpen(!bNewline);
	this.xml += bEscape ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : text;
	return this;
};

/**
 * Writes text preceded by a newline.
 * @param {String} text the text string to write. The text will be escaped.
 * @return {WAX} this WAX instance
 */
WAX.prototype.nlText = function(text, bEscape){
	return this.text(text, true, bEscape);
};



/**
 * Writes a processing instruction.
 * @param {String} target the PI target
 * @param {String} data the PI data
 * @return {WAX} this WAX instance
 */
WAX.prototype.processingInstruction = function(target, data){
	this.ensureOpen();
	this.closeStartTagIfOpen();
	this.xml += "<?" + target + " " + data + "?>";
	this.dontThinkEmpty();
	return this;
};

/**
 * Writes a processing instruction.
 * @param {String} target the PI target
 * @param {String} data the PI data
 * @return {WAX} this WAX instance
 */
WAX.prototype.pi = WAX.prototype.processingInstruction;

/**
 * Writes an XSLT processing instruction.
 * @param {String} src the XSLT URI
 * @return {WAX} this WAX instance
 */
WAX.prototype.xslt = function(src){
	return this.pi("xml-stylesheet", "type=\"text/xsl\" href=\"" + src + "\"");
};

/**
 * Writes the start tag for a given element name, but doesn't terminate it.
 * @param {String} prefix (optional) the namespace prefix
 * @param {String} name the element name
 * @return {WAX} this WAX instance
 */
WAX.prototype.start = function(prefix, name){
	this.ensureOpen();
	this.closeStartTagIfOpen();
	this.xml += "<";
	if(prefix){
		this.xml += prefix + ":";
		this.startTagNamespaces.push(prefix);
	}
	this.xml += name;
	this.closeStack.push(prefix ? prefix + ":" + name : name);
	this.depth++;
	this.dontThinkEmpty();
	return this;
};

/**
 * Terminates the current element.
 * @param {boolean} bForceEndTag whether to force a seperate close tag
 * if the element has no content
 * @return {WAX} this WAX instance
 */
WAX.prototype.end = function(bForceEndTag){
	this.ensureOpen();
	if(this.context ==  WAX.CONTEXT_START_TAG && !bForceEndTag){
		this.xml += " />";
	}
	else{
		this.xml += "</" + this.closeStack.pop + ">";
	}
	this.depth--;
	return this;
};

/**
 * Terminates all unterminated elements and insures that nothing else can be written.
 */
WAX.prototype.close = function(){
	this.ensureOpen();
	while(this.closeStack.length > 0){
		this.end();
	}
};

/**
 * A convenience method that is a shortcut for start(prefix, name).text(text).end()
 * @param {String} prefix (optional) the namespace prefix
 * @param {String} name the element name
 * @param {String} text the text string to write. The text will be escaped.
 * @return {WAX} this WAX instance
 */
WAX.prototype.child = function(prefix, name, text){
	return this.start(prefix, name).text(text).end();
};


/*

 PrologWAX 	dtd(java.lang.String filePath)
          Writes a DOCTYPE that associates a DTD with the XML document.
          
 PrologWAX 	entityDef(java.lang.String name, java.lang.String value)
          Adds an entity definition to the internal subset of the DOCTYPE.
          
 PrologWAX 	externalEntityDef(java.lang.String name, java.lang.String filePath)
          Adds an external entity definition to the internal subset of the DOCTYPE.
          
 StartTagWAX 	namespace(java.lang.String prefix, java.lang.String uri, java.lang.String schemaPath)
          Writes a namespace declaration in the start tag of the current element.
          
static PrologWAX 	newInstance()
          Creates a new WAX object that writes to stdout and returns it as an interface type that restricts the first method call to be one that is valid for the initial ouptut.
static PrologWAX 	newInstance(java.io.OutputStream os)
          Creates a new WAX object that writes to a given OutputStream and returns it as an interface type that restricts the first method call to be one that is valid for the initial ouptut.
static PrologWAX 	newInstance(java.lang.String filePath)
          Creates a new WAX object that writes to a given file path and returns it as an interface type that restricts the first method call to be one that is valid for the initial ouptut.
static PrologWAX 	newInstance(java.io.Writer writer)
          Creates a new WAX object that writes to a given Writer and returns it as an interface type that restricts the first method call to be one that is valid for the initial ouptut.

 void 	setIndent(int numSpaces)
          Sets the number of spaces to use for indentation.
          
 void 	setIndent(java.lang.String indent)
          Sets the indentation characters to use.
          
          
          
*/