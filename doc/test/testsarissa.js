/**
        	var xslDoc = Sarissa.getDomDocument();
        	xslDoc.async = false;
        	xslDoc.load(xslUrl);
        	processor.setParameter("", "user", "hax");
        	return processor.transformToFragment(xmlDoc, ownerDoc);
        	var console = document.getElementById('console');
        	console.innerHTML += '====\n' + s.serializeToString(node) + '\n\n';