

/**
 * Create a SarissaTableSorter instance tailored to the given table data
 * @constructor
 * @param arr The table element <strong>or</strong> table data as an Array instance 
 */
function SarissaTableUtils(arr, skipRowOne){
	// TODO: remove and add constants
	this.arrSortFuncs = new Array();
	/*if(skipRowOne && skipRowOne == 1){
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
	this.arrowDirection = null;*/
}

// TODO: add callback function

SarissaTableUtils.prototype.sortOn = function(iColIndex, clickedElem, iFunc){
    if(!iFunc){
        iFunc = null;
    }
	// get the cell's parent table
	var clickedElemName = clickedElem.nodeName.toLowerCase(); 
	if(clickedElemName != "th" && clickedElemName != "td"){
		throw new Exception("The given element was not a table heading (th) or cell (td)");
	}
	var oTable = clickedElem.parentNode.parentNode;
	while(oTable.nodeName.toLowerCase() != "table"){
	    oTable = oTable.parentNode;
	}
	// get tbody
	var oTableBody = oTable.getElementsByTagName("tbody")[0];
	// read table 
	var matrix = this.readTableBody(oTableBody);
	alert("matrix: "+matrix);
	// build a column-specific array to sort, adding 
	// original index info
	var temp = [];//new Array(matrix.length);
	for(var i=0; i < matrix.length;i++){
		temp[i] = Sarissa.stripTags(matrix[i][iColIndex]) + "_mbns_" + i;
	}
	
	alert("tmp unsorted: "+temp);
	// sort TODO: add sort func constants
	if(iFunc){
		temp.sort(iFunc);
	}
	else{
		temp.sort();
	}
	// check/change asc/desc as a custom attribute
	var sortOrder = clickedElem.getAttribute("sarissa-sort-order");
	if(sortOrder == "desc"){
		temp.reverse();
		clickedElem.setAttribute("sarissa-sort-order", "asc");
	}
	else{
		clickedElem.setAttribute("sarissa-sort-order", "asc");
	}
	
	alert("tmp sorted: "+temp);
	var tempMatrix = new Array(matrix.length);
	for(var j=1; j < tempMatrix.length; j++){
		var iRow = temp[j].substring(temp[j].indexOf("_mbns_")+6, temp[j].length);
		tempMatrix[j] = new Array();
		for(var k=1; k < matrix[j].length; k++)
			tempMatrix[j][k] = matrix[iRow][k];
	}
	
	alert("tempMatrix: "+tempMatrix);
	this.updateTableBody(oTableBody, tempMatrix);
};
SarissaTableUtils.prototype.setSortFuncs = function(arr){
	for(var i=0;i<arr.length;i++)
		this.arrSortFuncs[i] = arr[i];
};
SarissaTableUtils.prototype.SORT_IGNORE_CASE = function(a, b){
  var strA = a.toLowerCase(),
      strB = b.toLowerCase();
  if(strA < strB) return -1;
  else if(strA > strB) return 1;
  else return 0;
};
SarissaTableUtils.prototype.SORT_DATE_US = function(a, b){
	var datA = new Date(a.substring(0, a.lastIndexOf("_mbns_"))),
		datB = new Date(b.substring(0, b.lastIndexOf("_mbns_")));
	if(datA < datB)	return -1;
	else if(datA > datB) return 1;
    else return 0;
};
SarissaTableUtils.prototype.SORT_DATE_EU = function(a, b){
	var strA = a.substring(0, a.lastIndexOf("_mbns_")).split("/"), 
		strB = b.substring(0, b.lastIndexOf("_mbns_")).split("/"),
		datA = new Date(strA[2], strA[1], strA[0]), 
		datB = new Date(strB[2], strB[1], strB[0]);
	if(datA < datB) return -1;
	else if(datA > datB) return 1;
    else return 0;
}
SarissaTableUtils.prototype.readTableBody = function(oTableBody){
	var rows = oTableBody.getElementsByTagName("tr");
	var arrX = new Array();
	for(var i=0; i < rows.length; i++)
	{
		arrX[i] = new  Array();
		var cells = rows[i].getElementsByTagName("td");
		for(var j=0; j < cells.length; j++){
			arrX[i][j] = cells[j].innerHTML;
		}
	}
	return arrX;
}
SarissaTableUtils.prototype.updateTableBody = function(oElem, newData){
	var iRows = oElem.getElementsByTagName("tr");
	for(var i=0; i < iRows.length; i++){
		var iCols = iRows[i].getElementsByTagName("td");
		for(var j=0; j < iCols.length; j++){
			iCols[j].innerHTML = newData[i][j];
		}
	}
	
	/*
	
	for(i=0;i<this.matrix.length;i++){
		var tTr = document.createElement('tr');
		
		tTr.setAttribute("title", this.matrix[i][0]);
		for(var j=0;j<this.matrix[0].length;j++){
			var tTd  = document.createElement('td');
			var tTxt = document.createTextNode(this.matrix[i][j]);
			tTd.appendChild(tTxt);
			tTr.appendChild(tTd);
		}		
		this.oDataElem.appendChild(tTr);
		document.getElementsByTagName("textarea")[0].value = this.oDataElem.innerHTML;
	}
	 */
}


SarissaTableUtils.prototype.appendTo = function(containerId, replacableId)
{
	var exElem = document.getElementById(replacableId);
	var sId = exElem.getAttribute("id");
	exElem.removeAttribute("id");
	this.oDataElem.setAttribute("id", sId);
	document.getElementById(containerId).replaceChild(this.oDataElem, exElem);
	this.oDataElem = document.createElement("tbody");
}
SarissaTableUtils.prototype.fixArrows = function(oElem)
{
	if(oElem)
	{
		if(this.lastColIndex != (-1))
			oElem.parentNode.getElementsByTagName(oElem.nodeName)[this.lastColIndex].getElementsByTagName("img")[0].src = "img/trans9x6.gif";
		oElem.getElementsByTagName("img")[0].src = "img/smallBlackArrow" + this.arrowDirection + ".gif";
	}
}
