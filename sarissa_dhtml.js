/**
 * 
 */
Sarissa.loadUrlToElement(url, oElement, transformer) {
    element.innerHTML = '<p><em>Loading ...</em></p>';
    xmlhttp.open("GET", fragment_url);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            element.innerHTML = xmlhttp.responseText;
        }
    }
    xmlhttp.send(null);
}