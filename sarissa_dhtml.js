/**
 * 
 */
Sarissa.updateContentFromURL(sFromUrl, oTargetElement, xsltproc) {
    document.body.style.cursor = "wait";
    var xmlhttp = Sarissa.getXmlHttpRequest();
    xmlhttp.open("GET", fragment_url);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            Sarissa.upodateContentFromNode(xmlhttp.responseXML, oTargetElement, xsltproc);
	    };
    };
    xmlhttp.send(null);
};


Sarissa.upodateContentFromNode(xmlhttp.responseXML, oTargetElement, xsltproc){
    Sarissa.clearChildNodes(oTargetElement);
    var result = xmlhttp.responseXML;
    if(!result || result.parseError != 0){
        var pre = document.createElement("pre");
        pre.appendChild(document.createTextNode("<pre>"+Sarissa.getParseErrorText(result)+"</pre>"));
        oTargetElement.appendChild(pre);
    }else{
        Sarissa.copyChildNodes(xsltproc!=null?xsltproc.transformToDocument(result):result, oTargetElement);
    };
};