
/*

Ola ta dedomena mas ta parexei to wikipedia api. sta paradeigmata xrisimopoiw to en alla an baleis to prefix opoiasdipote glwssas psaxneis sto antistoixo (el, fr etc)

1)query gia ena arthro
en.wikipedia.org/w/api.php?action=query&redirects&format=xml&prop=revisions&rvprop=content&titles=Jack_London
opou pairneis olo to txt

2)
gia na pareis ta backlinks enos arthrou (ti kanei link sto arthro):
en.wikipedia.org/w/api.php?action=query&generator=backlinks&format=xml&gbllimit=500&gbltitle=Jack_London

3)
(anazitisi, xrisimo se periptwsi mispell)
en.wikipedia.org/w/api.php?action=query&list=search&srsearch=Jack_London&srwhat=text&srnamespace=0&format=xml&srlimit=50
search

4)
en.wikipedia.org/w/api.php?format=xml&action=query&prop=categories&titles=Jack_London
categories an article belongs to

5)
en.wikipedia.org/w/api.php?format=xml&action=query&cmlimit=500&list=categorymembers&cmtitle=Category:Islands_of_Greece
ta articles pou anikoun  se mia katigoria


format=xml mporeis na baleis json h o,ti allo parexetai
(http://en.wikipedia.org/w/api.php)

ta 2-5 ginontai parsing kai pairneis ta info pou theleis (px ta bazeis se lists). To 1) exei oli tin pliroforia gia ena arthro kai einai se mediawiki markup...apo kei kai pera thelei convertion se html (i clear text, opws ginetai sto indywiki). mediawiki->html converter gia python den uparxei distixws, kapoios pou na leitourgei aksioprepws. se java den kserw an iparxei, pantws gia php pera apo to mediawiki to idio prepei na uparxoun converters


*/



/**
 * Class that can be used to perform queries against a MediaWiki instance 
 * @constructor
 * @param apiUrl the base API URL, e.g. <a href="http://en.wikipedia.org/w/api.php" title="Link to Wikipedia's MediaWiki API Instance">http://en.wikipedia.org/w/api.php</a>
 * @callback the callback function to use
 */ 
function SarissaMediaWikiContext(apiUrl, arrLanguages){
	this.baseUrl = apiUrl;
	this.format = "json";
	this.languages = arrLanguages;
};


/**
 * Asynchronously obtain an article from the Wiki, then pass it to the given 
 * callback function as JSON data. This method does any required URL encoding for you.
 * @param sFor the article name
 * @callback the callback function to use
 */ 
SarissaMediaWikiContext.prototype.doArticleGet = function(sFor, callback){
	Sarissa.setRemoteJsonCallback(
		this.baseUrl + 
			"?action=query&redirects&format=" + 
			this.format + 
			"&prop=revisions&rvprop=content&titles=" + 
			encodeURIComponent(sFor), 
		callback);
};

/**
 * Asynchronously obtain an article's backlinks from the Wiki, then pass those to the given 
 * callback function as JSON data. This method does any required URL encoding for you.
 * @param sFor the article name
 * @param iLimit the maximum number of results to retreive
 * @callback the callback function to use
 */ 
SarissaMediaWikiContext.prototype.doBacklinksGet = function(sFor, iLimit, callback){
	Sarissa.setRemoteJsonCallback(
		this.baseUrl + 
			"?&generator=backlinks&format=" + 
			this.format + 
			"&gbllimit=" + 
			iLimit + 
			"&gbltitle" + 
			encodeURIComponent(sFor), 
		callback);
};

/**
 * Asynchronously obtain the articles belonging to a category from the Wiki, 
 * then pass those to the given callback function as JSON data. This method 
 * does any required URL encoding for you.
 * @param sFor the article name
 * @param iLimit the maximum number of results to retreive
 * @callback the callback function to use
 */ 
SarissaMediaWikiContext.prototype.doCategorySearch = function(sFor, iLimit, callback){
	Sarissa.setRemoteJsonCallback(
		this.baseUrl + 
			"?format=" + 
			this.format + 
			"&list=categorymembers&action=query&cmlimit=" + 
			iLimit + 
			"&cmtitle=Category:" + 
			encodeURIComponent(sFor), 
		callback);
};

