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
 * <p> Creates a WAX.</p>
 * @constructor
 * @static
 * @param {String} s Optional: the string to write the XML into.
 */
 function WAX(s){
 	this.xml = s ? s : "";
 	this.indent = " ";
 	this.closeStack = [];
 	this.namespaces = [];
 	this.namespaces["xml"] = "http://www.w3.org/XML/1998/namespace";
 	this.namespaces["xmlns"] = "http://www.w3.org/2000/xmlns/";
 	this.context =  WAX.CONTEXT_EMPTY_DOCUMENT;
 }
 /** @private */
 WAX.CONTEXT_EMPTY_DOCUMENT = 0;
 /** @private */
 WAX.CONTEXT_PROLOGED_DOCUMENT = 1;
 /** @private */
 WAX.CONTEXT_DOCTYPED_DOCUMENT = 2;
 /** @private */
 WAX.CONTEXT_START_TAG = 3;
 /** @private */
 WAX.CONTEXT_MIXED_CONTENT = 4;
 
 // throw if invalid
 WAX.validateNameToken(prefix) {
 	if(prefix.toLowerCase().indexOf("xml") == 0){
 		throw "A name token cannot start with 'XML'";
 	}
 	
 }
 
 
/**
 * Writes an attribute for the currently open element start tag.
 * @param {String} prefix the namespace prefix for the attribute
 * @param {String} name the attribute name 
 * @param {Object} value the attribute value. The string value of the object will be escaped.
 * @param {boolean} bNewLine true to write on a new line for readability; false otherwise. Default is false.
 * @return {WAX} this WAX instance
 */
WAX.prototype.attr = function(prefix, name, value, newLine){
	if(this.context !=  WAX.CONTEXT_START_TAG){
		throw "WAX: Cannot add an attribute or namespace at this context. " +
			"Given prefix: " + prefix +
			", name: " + name +
			", value: " + value;
	}
	if(bNewLine){
		this.blankLine();
	}
	else{
		s += " ";
	}
	if(prefix){
		if(!this.namespaces[prefix]){
			throw "WAX: Cannot use undeclared namespace prefix: " + prefix;
		}
		s += prefix + ":";
	}
	s += "\"" + Sarissa.escape(value) + "\"";
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
 * Get the indentation characters being used.
 * @return {String} the indentation characters being used
 */
WAX.prototype.getIndent = function(){
	return this.indent;
};

/**
 * Writes a blank line to increase readability of the XML.
 * @return {WAX} this WAX instance
 */
WAX.prototype.blankLine = function(){
	s += "\n" + this.indent;
	return this;
};

/**
 * Writes a CDATA section in the content of the current element.
 * @param {String} text the text string to write (unescaped) within the CDATA section
 * @return {WAX} this WAX instance
 */
WAX.prototype.cdata = function(text){
	if(this.context !=  WAX.CONTEXT_MIXED_CONTENT){
		throw "WAX: Cannot write CDATA section in this context";
	}
	this.blankLine();
	s += "<![CDATA[" + text + "]]>";
	return this;
};

/**
 * Writes a CDATA section in the content of the current element.
 * @param {String} text the text string to write (unescaped) within the CDATA section
 * @return {WAX} this WAX instance
 */
WAX.prototype.comment = function(text){
	if(this.context !=  WAX.CONTEXT_MIXED_CONTENT){
		throw "WAX: Cannot write comment in this context";
	}
	if(text.indexOf("--") != -1){
		throw "WAX: Comments cannot contain '--'";
	}
	this.blankLine();
	s += "<!--" + Sarissa.escape(text) + "-->";
	return this;
};
/**
 * Writes text preceded by a newline.
 * @param {String} text the text string to write
 * @param {boolean} bEscape whether to escape the text. Default is true
 * @return {WAX} this WAX instance
 */
WAX.prototype.nlText = function(text){
	// TODO: change context
	this.blankLine();
	s += Sarissa.escape(text);
	return this;
};

/*

 ElementWAX 	child(java.lang.String name, java.lang.String text)
          A convenience method that is a shortcut for start(name).text(text).end().
 ElementWAX 	child(java.lang.String prefix, java.lang.String name, java.lang.String text)
          A convenience method that is a shortcut for start(prefix, name).text(text).end().
 void 	close()
          Terminates all unterminated elements, closes the Writer that is being used to output XML, and insures that nothing else can be written.
 P
 PrologWAX 	dtd(java.lang.String filePath)
          Writes a DOCTYPE that associates a DTD with the XML document.
 ElementWAX 	end()
          Terminates the current element.
 PrologWAX 	entityDef(java.lang.String name, java.lang.String value)
          Adds an entity definition to the internal subset of the DOCTYPE.
 PrologWAX 	externalEntityDef(java.lang.String name, java.lang.String filePath)
          Adds an external entity definition to the internal subset of the DOCTYPE.
          
 boolean 	isTrustMe()
          Gets whether "trust me" mode is enabled.
 
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
 ElementWAX 	nlText(java.lang.String text)
          Writes text preceded by a newline.
 PrologOrElementWAX 	processingInstruction(java.lang.String target, java.lang.String data)
          Writes a processing instruction.
 void 	setIndent(int numSpaces)
          Sets the number of spaces to use for indentation.
 void 	setIndent(java.lang.String indent)
          Sets the indentation characters to use.
 void 	setTrustMe(boolean trustMe)
          Gets whether "trust me" mode is enabled.
 StartTagWAX 	start(java.lang.String name)
          Writes the start tag for a given element name, but doesn't terminate it.
 StartTagWAX 	start(java.lang.String prefix, java.lang.String name)
          Writes the start tag for a given element name, but doesn't terminate it.
 ElementWAX 	text(java.lang.String text)
          Writes text inside the content of the current element.
 ElementWAX 	text(java.lang.String text, boolean newLine, boolean escape)
          Writes text inside the content of the current element.
 PrologWAX 	xslt(java.lang.String filePath)
          Writes an "xml-stylesheet" processing instruction.
          
*/