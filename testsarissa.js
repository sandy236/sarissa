/** @constructor */
function SarissaTestCase() {
	/** @final */
    this.name = 'SarissaTestCase';
    
    /** Test the <code>Sarissa.getDomDocument()</code> method */
    this.testGetDomDocument = function(){
		this.assert(Sarissa.getDomDocument("http://foo.bar/","foo", null));
		this.assert(Sarissa.getDomDocument());
    };
    
    /** Test the <code>Sarissa.getXmlHttpRequest()</code> property */
    this.testGetXmlHttpRequest = function(){
		this.assert(Sarissa.getXmlHttpRequest());
    };
};
SarissaTestCase.prototype = new TestCase;


/** @constructor */
function XMLDocumentTestCase() {
	/** @final */
	this.name = 'XMLDocumentTestCase';
	
	this.xmlDoc = null;
	
	this.setUp = function() {
        this.xmlDoc = Sarissa.getDomDocument();
    };
    
    /** Test the <code>XMLDocument.loadXML()</code> method */
    this.testLoadXML = function() {
    	this.xmlDoc.loadXML("<root/>");
		this.assertEquals(this.xmlDoc.documentElement.tagName, "root");
    };
    
    /** Test the <code>XMLDocument.xml (read)</code> property */
    this.testXmlRead = function() {
		this.xmlDoc = Sarissa.getDomDocument("", "foo", null);
    	this.assertEquals(this.xmlDoc.xml, "<foo/>");
    };
    
    /** Test the <code>XMLDocument.xml (write)</code> property */
    this.testXmlWrite = function() {
    	this.assertThrows(function(){
    		var xmlDoc = Sarissa.getDomDocument("", "foo", null);
    		xmlDoc.xml = "foo bar";
    	});
    };
};
XMLDocumentTestCase.prototype = new TestCase;