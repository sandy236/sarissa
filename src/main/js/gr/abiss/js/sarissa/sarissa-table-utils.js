/*
 * ====================================================================
 * About Sarissa: http://dev.abiss.gr/sarissa
 * ====================================================================
 * Sarissa is an ECMAScript library acting as a cross-browser wrapper for native XML APIs.
 * The library supports Gecko based browsers like Mozilla and Firefox,
 * Internet Explorer (5.5+ with MSXML3.0+), Konqueror, Safari and Opera
 * @author: @author: Copyright 2004-2007 Emmanouil Batsis, mailto: mbatsis at users full stop sourceforge full stop net
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
 * @param tableId the id of  the <code>table</code> or <code>tbody</code> to sort
 * @param 
 * 
 * @requires Sarissa sarissa.js
 */
Sarissa.sortHtmlTableData = function(tableId, iColIndex, clickedElem, iFunc, oCallbac){
	// get the cell's parent tbody or table
	var clickedElemName = clickedElem.nodeName.toLowerCase(); 
	if(clickedElemName != "th" && clickedElemName != "td"){
		throw new Exception("The given element was not a table heading (th) or cell (td)");
	}
	var oTbl = clickedElem.parentNode.parentNode;
	while(oTbl.nodeName.toLowerCase() != "table"){
	    oTbl = oTbl.parentNode;
	}
	// read table, skip any rows containing headings
	var matrix = this.readRowsToArray(oTbl, null, null, "th");
	// build a column-specific array to sort, adding 
	// original index info as a suffix to the original data
	var sortedColumn = new Array(matrix.length);
	for(var i=0; i < matrix.length;i++){
		sortedColumn[i] = Sarissa.stripTags(matrix[i][iColIndex]) + "_mbns_" + i;
	}
	// sort 
	if(iFunc){
		sortedColumn.sort(iFunc);
	}
	else{
		sortedColumn.sort();
	}
	// creae the sorted matrix based on sortedColumn
	var sortedMatrix = [];
	for(var j=0; j < matrix.length; j++){
		var indexItem = sortedColumn[j];
		var iRow = indexItem.substring(indexItem.indexOf("_mbns_")+6, indexItem.length);
		sortedMatrix[j] = new Array(matrix[j].length);
		for(var k=0; k < matrix[j].length; k++)
			sortedMatrix[j][k] = matrix[iRow][k];
	}
	
	// update all headings
	
	// check/change asc/desc as a custom attribute
	var sortOrder = clickedElem.getAttribute("sarissa-sort-order");
	//var sortColumn = clickedElem.getAttribute("sarissa-sort-column");
	//alert("sarissa-sort-order: "+clickedElem.getAttribute("sarissa-sort-order"));
	if(sortOrder == "asc"){
		sortedColumn.reverse();
		clickedElem.setAttribute("sarissa-sort-order", "desc");
	}
	else{
		clickedElem.setAttribute("sarissa-sort-order", "asc");
	}
	// update table data skipping rows with headings
	this.updateTableData(oTbl, sortedMatrix, null, null, "th");
	oCallbac();
};

Sarissa.tableSortCache = [];
Sarissa.tableSortCacheSize = 5;
Sarissa.tableSortCachePut = function(oArr){
	// TODO
}


/**
 * Function for case-insensitive sorting or simple comparison. Can be used as 
 * a parameter to <code>Array.sort()</code>.
 * @param a a string
 * @param b a string
 * @return -1, 0 or 1 depending on whether <code>a</code> is "less than", equal or "greater than" <code>b</code>
 */
Sarissa.SORT_IGNORE_CASE = function(a, b){
  var strA = a.toLowerCase(),
      strB = b.toLowerCase();
  if(strA < strB) return -1;
  else if(strA > strB) return 1;
  else return 0;
};

/**
 * Function for comparing US dates. Can be used as 
 * a parameter to <code>Array.sort()</code>.
 * @param a a string
 * @param b a string
 * @return -1, 0 or 1 depending on whether <code>a</code> is "less than", equal or "greater than" <code>b</code>
 */
Sarissa.SORT_DATE_US = function(a, b){
	var datA = new Date(a.substring(0, a.lastIndexOf("_mbns_"))),
		datB = new Date(b.substring(0, b.lastIndexOf("_mbns_")));
	if(datA < datB)	return -1;
	else if(datA > datB) return 1;
    else return 0;
    
};

/**
 * Function for comparing EU dates. Can be used as 
 * a parameter to <code>Array.sort()</code>.
 * @param a a string
 * @param b a string
 * @return -1, 0 or 1 depending on whether <code>a</code> is "less than", equal or "greater than" <code>b</code>
 */
Sarissa.SORT_DATE_EU = function(a, b){
	var strA = a.substring(0, a.lastIndexOf("_mbns_")).split("/"), 
		strB = b.substring(0, b.lastIndexOf("_mbns_")).split("/"),
		datA = new Date(strA[2], strA[1], strA[0]), 
		datB = new Date(strB[2], strB[1], strB[0]);
	if(datA < datB) return -1;
	else if(datA > datB) return 1;
    else return 0;
};

/**
 * Get the data of the given element as a two-dimensional array. The 
 * given XML or HTML Element must match the structure of an HTML table, 
 * although element names may be different.
 * @param oElem an HTML or XML table. The method works out of the box 
 * for <code>table</code>, <code>tbody</code>, <code>thead</code> 
 * or <code>tfooter</code> elements. For custom XML tables, the 
 * <code>sRowName</code> <code>sCellName</code> must be used.
 * @param sRowName the row element names. Default is <code>tr</code>
 * @param sCellName the row element names. Default is <code>td</code>
 * @param sHeadingName the heading element names. If you use this, rows with 
 * headings will be <strong>skipped</strong>. To skip headings when reading 
 * HTML tables use <code>th</code>
 * @param bStripTags whether to strip markup from cell contents. Default is <code>false</code>
 * @return a two-dimensional array with the data found in the given element's rows
 */
Sarissa.readRowsToArray = function(oElem, sRowName, sCellName, sHeadingName, bStripTags){
	if(!sRowName){
		sRowName = "tr"
	}
	if(!sCellName){
		sCellName = "td"
	}
	if(!sHeadingName){
		sHeadingName = "th"
	}
	var rows = oElem.getElementsByTagName(sRowName);
	var matrix = [];
	for(var i=0, j=0; i < rows.length; i++) {
		// skip rows with headings
		var row = rows[i];
		if((!sHeadingName) || row.getElementsByTagName(sHeadingName).length == 0){
			matrix[j] = [];
			var cells = row.getElementsByTagName(sCellName);
			for(var k=0; k < cells.length; k++){
				matrix[j][k] = bStripTags ? Sarissa.stripTags(cells[k].innerHTML) : cells[k].innerHTML;
			}
			j++;
		}
	}
	return matrix;
};

/**
 * Update the data of the given element using the giventwo-dimensional array as a source. The 
 * given XML or HTML Element must match the structure of an HTML table.
 * @param oElem an HTML or XML table. The method works out of the box 
 * for <code>table</code>, <code>tbody</code>, <code>thead</code> 
 * or <code>tfooter</code> elements. For custom XML tables, the 
 * <code>sRowName</code> <code>sCellName</code> must be used.
 * @param sRowName the row element names. Default is <code>tr</code>
 * @param sCellName the row element names. Default is <code>td</code>
 * @param sHeadingName the heading element names. If you use this, rows with 
 * headings will be <strong>skipped</strong>. To skip headings when reading 
 * HTML tables use <code>th</code>
 */
Sarissa.updateTableData = function(oElem, newData, sRowName, sCellName, sHeadingName){
	if(!sRowName){
		sRowName = "tr"
	}
	if(!sCellName){
		sCellName = "td"
	}
	if(!sHeadingName){
		sHeadingName = "th"
	}
	var rows = oElem.getElementsByTagName(sRowName);
	for(var i=0, j=0; i < newData.length && j < rows.length; j++){
		// skip rows with headings
		var row = rows[j];
		if((!sHeadingName) || row.getElementsByTagName(sHeadingName).length == 0){
			var cells = row.getElementsByTagName(sCellName);
			for(var k=0; k < cells.length; k++){
				cells[k].innerHTML = newData[i][k];
			}
			i++;
		}
	}
};
