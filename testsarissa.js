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



/** Test the <code>XMLDocument.selectNodes()</code> method */
testSelectNodes = function() {
    this.xmlDoc.loadXML("<root/>");
    var nodeList = this.xmlDoc.selectNodes("*");
    this.assertEquals(nodeList.length, 1);
    this.assertEquals(nodeList.item(0), nodeList[0]);
};

/** Test the <code>XMLDocument.selectSingleNode()</code> method */
testSelectSingleNode = function() {
    this.xmlDoc.loadXML("<root/>");
    var node = this.xmlDoc.selectSingleNode("*");
    this.assert(node);
    this.assertEquals(node.tagName, "root");
};

/** Test the <code>XMLDocument.xml (read)</code> property */
testXmlRead = function() {
    this.xmlDoc = Sarissa.getDomDocument("", "foo", null);
    this.assertEquals(this.xmlDoc.xml, "<foo/>");
};

/** Test the <code>XMLDocument.xml (write)</code> property */
testXmlWrite = function() {
    this.assertThrows(function(){
        var xmlDoc = Sarissa.getDomDocument("", "foo", null);
        xmlDoc.xml = "foo bar";
    });
};
    
/** @constructor */
function XMLDocumentTestCase() {
	/** @final */
	this.name = 'XMLDocumentTestCase';
	
	this.xmlDoc = null;
	
	this.setUp = function() {
        this.xmlDoc = Sarissa.getDomDocument();
	};
    
    /** Test the <code>XMLDocument.loadXML()</code> method */
    this.testLoad = function() {
        this.xmlDoc.async = false;
        this.xmlDoc.load("test.xml");
        this.assertEquals(this.xmlDoc.documentElement.tagName, "root");
    };
    
    /** Test the <code>XMLDocument.loadXML()</code> method */
    this.testLoadXML = function() {
    	this.xmlDoc.loadXML("<root/>");
		this.assertEquals(this.xmlDoc.documentElement.tagName, "root");
    };
    
    
    /** Test the <code>XMLDocument.selectNodes()</code> method */
    this.testSelectNodes = testSelectNodes
    
    /** Test the <code>XMLDocument.selectSingleNode()</code> method */
    this.testSelectSingleNode = testSelectSingleNode;
    
    /** Test the <code>XMLDocument.xml (read)</code> property */
    this.testXmlRead = testXmlRead;
    
    /** Test the <code>XMLDocument.xml (write)</code> property */
    this.testXmlWrite = testXmlWrite;
};
XMLDocumentTestCase.prototype = new TestCase;


/** @constructor */
function XMLElementTestCase() {
	/** @final */
	this.name = 'XMLElementTestCase';
	
	this.xmlDoc = null;
	
	this.setUp = function() {
        this.xmlDoc = Sarissa.getDomDocument();
	};
    
    /** Test the <code>XMLElement.selectNodes()</code> method */
    this.testSelectNodes = testSelectNodes
    
    /** Test the <code>XMLElement.selectSingleNode()</code> method */
    this.testSelectSingleNode = testSelectSingleNode;
    
    /** Test the <code>XMLElement.xml (read)</code> property */
    this.testXmlRead = testXmlRead;
    
    /** Test the <code>XMLElement.xml (write)</code> property */
    this.testXmlWrite = testXmlWrite;
};
XMLElementTestCase.prototype = new TestCase;


/** @constructor */
function HTMLElementTestCase() {
	/** @final */
	this.name = 'HTMLElementTestCase';
	
	/** Test the <code>HTMLElement.innerText (read)</code> property */
	this.testInnerText = function(){
		var s = "test string";
		var p = window.document.createElement("p");
		this.assert(p.innerText.length > -1);
		p.appendChild(document.createTextNode(s));
		this.assertTrue(p.innerText.length > 0);
	};
};
HTMLElementTestCase.prototype = new TestCase;