/**
 * ====================================================================
 * About
 * ====================================================================
 * Sarissa cross browser XML library - DHTML module
 * @version @project.version@
 * @author: Manos Batsis, mailto: mbatsis at users full stop sourceforge full stop net
 *
 * This module contains some convinient DHTML tricks based on Sarissa 
 *
 * ====================================================================
 * Licence
 * ====================================================================
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 or
 * the GNU Lesser General Public License version 2.1 as published by
 * the Free Software Foundation (your choice of the two).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License or GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * or GNU Lesser General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 * or visit http://www.gnu.org
 *
 */
/**
 * Update an element with response of a GET request on the given URL. 
 * @param sFromUrl the URL to make the request to
 * @param oTargetElement the element to update
 * @param xsltproc (optional) the transformer to use on the returned
 *                  content before updating the target element with it
 */
Sarissa.updateContentFromURI = function(sFromUrl, oTargetElement, xsltproc) {
    document.body.style.cursor = "wait";
    var xmlhttp = Sarissa.getXmlHttpRequest();
    xmlhttp.open("GET", fragment_url);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.body.style.cursor = "";
            Sarissa.updateContentFromNode(xmlhttp.responseXML, oTargetElement, xsltproc);
	    };
    };
    xmlhttp.send(null);
};

/**
 * Update an element's content with the given DOM node.
 * @param sFromUrl the URL to make the request to
 * @param oTargetElement the element to update
 * @param xsltproc (optional) the transformer to use on the given 
 *                  DOM node before updating the target element with it
 */
Sarissa.updateContentFromNode = function(oNode, oTargetElement, xsltproc){
    try{
        Sarissa.clearChildNodes(oTargetElement);
        // check for parsing errors
        var oDoc = oNode.nodeType == Node.DOCUMENT_NODE?oNode:oNode.ownerDocument;
        if(oDoc.parseError != 0){
            var pre = document.createElement("pre");
            pre.appendChild(document.createTextNode(Sarissa.getParseErrorText(oDoc)));
            oTargetElement.appendChild(pre);
        }else{
            Sarissa.copyChildNodes(xsltproc!=null?xsltproc.transformToFragment(oNode, oDoc):oNode, oTargetElement);
        };
    }catch(e){
        throw new Error("Failed updating element content, original exception: "+e);
    };
};