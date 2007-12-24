/**
MB_TableSorter class. Author: Manos Batsis, mailto:xcircuit@yahoo.com
main methods:
	sortOn(column to base the sort, button/header matching the column)
	setSortFuncs(array of inegers. used to set the sort function for each column: 
0 for default, 1 for case-insensitive, 2 for date (US), 3 for date (european))
	autoCalled: readTable(table object) reads a table
	updateTblCellsTxt(table object) updates the contents of the table	
	* 
	* 
*/

/**
 * Create a SarissaTableSorter instance tailored to the given table data
 * @constructor
 * @param arr The table element <strong>or</strong> table data as an Array instance 
 */
function SarissaTableSorter(arr, skipRowOne){
	if(skipRowOne && skipRowOne == 1){
		this.skipRowOne = 1;
	}
	else{
		this.skipRowOne = 0;
	}
	if(arr instanceof Array){
		this.matrix = arr;
	}
	else{
		this.matrix = this.readTable(arr);
	}
	this.oDataElem = document.createElement("tbody");
	this.lastColIndex = -1;
	this.currentColIndex = -1;
	this.arrSortFuncs = new Array();
	this.arrowDirection = null;
}



SarissaTableSorter.prototype.sortOn = function(iColIndex, clickedElem, iFunc){
	// get parent table
	if(clickedElem.nodeName.toLowercase() != "td"){
		throw new Exception("The given element was not a table cell");
	}
	var oTable;
	for(oTable; oTable.nodeName != "table"; oTable = oTable.parentNode){
	}
	// read table 
	var matrix = this.readTable(oTable);
	// build a column-specific array to sort, adding 
	// original index info
	var temp = new Array(this.matrix.length);
	for(var i=0;i<temp.length;i++){
		temp[i] = this.matrix[i][iColIndex]+"_mbns_"+i;
	}
	// sort
	if(iFunc == 0) temp.sort();
	else if(iFunc == 1)temp.sort(this.noCaseFunc);
	else if(iFunc == 2)temp.sort(this.dateFunc);
	else if(iFunc == 3)temp.sort(this.dateEUFunc);
	// check/change asc/desc as a custom attribute
	var sortOrder = clickedElem.getAttribute("sarissa-sort-order");
	if(sortOrder == "desc"){
		temp.reverse();
		clickedElem.setAttribute("sarissa-sort-order", "asc");
	}
	else{
		clickedElem.setAttribute("sarissa-sort-order", "asc");
	}
	
	var tempMatrix = new Array(this.matrix.length);
	for(var j=0; j < tempMatrix.length; j++)
	{
		var iRow = temp[j].substring(temp[j].indexOf("_mbns_")+6, temp[j].length);
		tempMatrix[j] = new Array();
		for(var k=0; k < this.matrix[j].length; k++)
			tempMatrix[j][k] = this.matrix[iRow][k];
	}
	this.matrix = tempMatrix;
	this.lastColIndex = iColIndex;
};
SarissaTableSorter.prototype.setSortFuncs = function(arr){
	for(var i=0;i<arr.length;i++)
		this.arrSortFuncs[i] = arr[i];
};
SarissaTableSorter.prototype.noCaseFunc = function(a, b){
  var strA = a.toLowerCase(),
      strB = b.toLowerCase();
  if(strA < strB) return -1;
  else if(strA > strB) return 1;
  else return 0;
};
SarissaTableSorter.prototype.dateFunc = function(a, b){
	var datA = new Date(a.substring(0, a.lastIndexOf("_mbns_"))),
		datB = new Date(b.substring(0, b.lastIndexOf("_mbns_")));
	if(datA < datB)	return -1;
	else if(datA > datB) return 1;
    else return 0;
};
SarissaTableSorter.prototype.dateEUFunc = function(a, b){
	var strA = a.substring(0, a.lastIndexOf("_mbns_")).split("/"), 
		strB = b.substring(0, b.lastIndexOf("_mbns_")).split("/"),
		datA = new Date(strA[2], strA[1], strA[0]), 
		datB = new Date(strB[2], strB[1], strB[0]);
	if(datA < datB) return -1;
	else if(datA > datB) return 1;
    else return 0;
}
SarissaTableSorter.prototype.readTable = function(oElem){
	if(oElem.nodeName != "tbody")
		oElem = oElem.getElementsByTagName("tbody")[0];
	if(!oElem)
		return
	var iRows = oElem.getElementsByTagName("tr");
	var arrX = new Array();
	for(var i=0; i+this.skipRowOne < iRows.length; i++)
	{
		arrX[i] = new  Array();
		var iCols = iRows[i+this.skipRowOne].getElementsByTagName("td");
		for(var j=0; j < iCols.length; j++)
			arrX[i][j] = Sarissa.getText(iCols[j].childNodes[0]);
	}
	return arrX;	
}
SarissaTableSorter.prototype.updateTblCellsTxt = function(oElem)
{
	if(oElem.nodeName != "tbody")
		oElem = oElem.getElementsByTagName("tbody")[0];
	if(!oElem)
		return
	var iRows = oElem.getElementsByTagName("tr");
	for(var i=0; i+this.skipRowOne < iRows.length; i++)
	{
		var iCols = iRows[i+this.skipRowOne].getElementsByTagName("td");
		for(var j=0; j < iCols.length; j++)
			iCols[j].childNodes[0].data = this.matrix[i][j];
	}
}
SarissaTableSorter.prototype.toTbody = function()
{
	for(i=0;i<this.matrix.length;i++)
	{
		var tTr = document.createElement('tr');
		
		tTr.setAttribute("title", this.matrix[i][0]);
		for(var j=0;j<this.matrix[0].length;j++)
		{
			var tTd  = document.createElement('td');
			tTd.style.width = "30%";
			var tTxt = document.createTextNode(this.matrix[i][j]);
			tTd.appendChild(tTxt);
			tTr.appendChild(tTd);
		}		
		this.oDataElem.appendChild(tTr);
		document.getElementsByTagName("textarea")[0].value = this.oDataElem.innerHTML;
	}
}
SarissaTableSorter.prototype.appendTo = function(containerId, replacableId)
{
	var exElem = document.getElementById(replacableId);
	var sId = exElem.getAttribute("id");
	exElem.removeAttribute("id");
	this.oDataElem.setAttribute("id", sId);
	document.getElementById(containerId).replaceChild(this.oDataElem, exElem);
	this.oDataElem = document.createElement("tbody");
}
SarissaTableSorter.prototype.fixArrows = function(oElem)
{
	if(oElem)
	{
		if(this.lastColIndex != (-1))
			oElem.parentNode.getElementsByTagName(oElem.nodeName)[this.lastColIndex].getElementsByTagName("img")[0].src = "img/trans9x6.gif";
		oElem.getElementsByTagName("img")[0].src = "img/smallBlackArrow" + this.arrowDirection + ".gif";
	}
}
