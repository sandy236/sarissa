# This is not intended as a formal fork

I wanted to work on the [Sarissa](http://dev.abiss.gr/sarissa/) project,  but the original source code is still hosted in a CVS repository (ugh...). Therefore I took the liberty of importing the code to Github. I do not intend to formally fork the project, but having the code here will make it easier for me to create branches and diffs and to share my contributions to the project, which I intend to offer back to the upstream developers.

## How I imported the project

Importing a CVS repository into a Git repositoy proved harder than it should be.

The various answersm at https://stackoverflow.com/questions/881158/is-there-a-migration-tool-from-cvs-to-git turned out to be quite helpful in accomplishing this. I thank the people who contributed the answers there. **However**, it is important to note that the highest rated answer on that page at the time of this writing contains one crucial error: cvs2git requires a full CVS repository to be cloned using rsync. It will **not** work with just a checked out working copy, not even if you manually create an empty CVSROOT folder in it, as is incorrectly stated in that answer. Kudos to StackOverflow user [mhagger](https://stackoverflow.com/users/24478/mhagger) in particular for pointing that out.

# Official project website: [http://dev.abiss.gr/sarissa/](http://dev.abiss.gr/sarissa/)

The original overview from the official project website follows below. (Converted from HTML to GitHub-compatible Markdown language using the excellent conversion tool at [https://domchristie.github.io/to-markdown/](https://domchristie.github.io/to-markdown/). Go check it out!)

## <a name="Overview"></a>Overview

Sarissa is an ECMAScript library acting as a cross-browser wrapper for native XML APIs. It offers various XML related goodies like Document instantiation, XML loading from URLs or strings, XSLT transformations, XPath queries etc and comes especially handy for people doing what is lately known as "AJAX" development.

Supported browsers are Mozilla - Firefox and family, Internet Explorer with MSXML3.0 and up, Konqueror (KDE 3.3+ for sure), Safari and Opera. Konq and Safari offer no XSLT/XPath scripting support AFAIK.

For a HOWTO document that provides examples of common tasks see the [HOWTOs](http://dev.abiss.gr/sarissa/howtos.html) . The API documentation is generated using [JSDoc](http://jsdoctoolkit.org/) and can be found [here](http://dev.abiss.gr/sarissa/jsdoc/index.html) .

The latest version of Sarissa can always be found on [the Sourceforge project page](https://sourceforge.net/projects/sarissa/) . Please send comments, corrections etc through the [mailing list](http://dev.abiss.gr/sarissa/mail-lists.html) or the [forum](https://sourceforge.net/forum/forum.php?forum_id=256492) .

## <a name="License"></a>License

Sarissa is distributed under the [GNU GPL](http://dev.abiss.gr/sarissa/licenses/gpl.txt) version 2 or higher, [GNU LGPL](http://dev.abiss.gr/sarissa/licenses/lgpl.txt) version 2.1 or higher and [Apache Software License](http://dev.abiss.gr/sarissa/licenses/asl.txt) 2.0 or higher. You can use Sarissa according to any of those licenses.

## <a name="Credits"></a>Credits

See [CHANGELOG.txt](http://dev.abiss.gr/sarissa/CHANGELOG.txt) . Please let us know if your name is missing!

Projects used when developing Sarissa:

*   Apache [Maven](http://maven.apache.org/) and [Ant](http://maven.apache.org/) are used to build the Sarissa distributions, documentation and website. Sarissa can nowdays be used as a Maven dependency in your Maven-based webapps, [check it out](http://dev.abiss.gr/sarissa/installation.html) .
*   The [Maven JSTools Plugin](http://dev.abiss.gr/mvn-jstools/) is used to produce documentation based on [JSLint](http://www.jslint.com/) and [JSDoc Toolkit](http://jsdoctoolkit.org/) . The JSTools Plugin is also used in Maven based java webapps at runtime, to resolve Sarissa or other JS files and resources.
*   [ECMAUnit](http://kupu.oscom.org/download/) is used for Unit Testing. Check out the Sarissa Unit Tests page [here](http://dev.abiss.gr/sarissa/test/testsarissa.html) .
*   The [MobilVox Maven JavaScript Plugin](http://www.mobilvox.com/projects/maven-js-plugin/) is used to create the compressed versions of the Sarissa JS files.
*   The [Syntaxhighlighter](http://code.google.com/p/syntaxhighlighter/) is used for (obviously) syntax highlighting through out the documentation.

Here are some projects using Sarissa, please let us know if you would like to add yours here. This is in the credits simply because if Sarissa was not usefull we would not be working on it. Currently Sarissa has been downloaded about 70k times so we will be maintaining it for some time :-)

*   [XSLT for GWT](http://www.ebessette.com/d/software/XSLTForGWT) uses Sarissa to do exactly what it's name says it does.
*   [Totoe](http://code.google.com/p/totoe/) (Maori for "to split, devide") is a XML parser for GWT which comes with XPath and namespace support.
*   deCarta's [JavaScript API](http://www.decarta.com/products/dds/jsapi.html) , is used to integrate deCarta's Drill Down Server (DDS) geospatial platform into other applications.
*   Oscom's really cool [Kupu WYSIWYG Editor](http://kupu.oscom.org/)
*   [MapBuilder](http://communitymapbuilder.org/) , a modern standards-based web mapping client.
*   [Plone](http://plone.org/) , a user-friendly and powerful open source Content Management System.
*   [Anyterm](http://anyterm.org/) , a web based terminal interface for your servers (it sounds crazy at first but you quickly find yourself wondering "how come i never thought of that?").
*   [Communik8r](http://communik8r.org/) is a new email application for phpGroupWare. communik8r uses AJAX, IMAP sockets and client side XSLT
*   [WXplorer](http://wxplorer.sourceforge.net/) , a very slick, AJAX based file explorer for PHP applications.
*   The [Minesweeper game](http://dev.abiss.gr/sarissa/sample-apps/minesweeper/index.html) featured as a sample application was written by Sean Whalen, who is also the maintainer.
*   Jay Kimble's [JAAJAX Lib for .Net](http://codebetter.com/blogs/jay.kimble/archive/2005/08/16/130777.aspx) .
*   Jason Diamond's [My Ajax.NET library](http://jason.diamond.name/weblog/category/my-ajax-dot-net) .
*   [MojoPortal](http://www.mojoportal.com/) , an Object Oriented web site framework written in C# that runs under ASP.NET on Windows or under Mono on GNU/Linux and Mac OS X.
*   [Taleful.com](http://www.taleful.com/) is an interactive storytelling website. This website was created to give people a place where they can express themselves and share their stories. All are welcome to come, read and post stories, share and collaborate with others in joint story projects, receive creative writing feedback and enhance their imagination.
*   [Freja](http://www.csscripting.com/) (Framework for Restful Javascript Applications) is not yet another Ajax library. It is an Open-Source, MVC, High Level Ajax based Javascript Framework that lets you use your favorite javascript library if you wish. It actually plays well with other javascript toolkits and libraries (prototype, scriptaculous, dojo, etc..).
*   The [HyperScope](http://hyperscope.org/) is a high-performance thought processor that enables you to navigate, view, and link to documents in sophisticated ways. It is a completely client-side system implemented with Dojo and Sarissa.
*   [Ziizo](http://ziizo.com/) , an online service that allows you to create bookmarks, notes, quotations, lyrics, recipes etc. online and access them from anywhere. You can also create a public page and share with the world.
*   The [KSS project](http://kssproject.org/) (formerly known as Kukit) is a javascript framework that aims to allow Ajax development without javascript. It uses stylesheets with CSS-compliant syntax to setup behaviours in the client and a set of well-defined commands that are marshalled back from the server to manipulate the DOM.
*   [MapGuide Open Source](http://mapguide.osgeo.org/) is a web-based platform that enables users to quickly develop and deploy web mapping applications and geospatial web services.
*   [Opportuno](http://www.opportuno.de/) is jobs search engine for employment opportunities in Germany. Its "Instant View" search interface is completely based on the Sarissa library.
*   Dr. Dobb's [FlipBook](http://www.ddjsilverlight.com/flipbook/) , an e-zine built on Silverlight
*   [jstree](http://code.google.com/p/jstree/) , a tree component based on jQuery uses Sarissa to transform XML datasources.
*   [Ajaxterm](http://antony.lesuisse.org/qweb/trac/wiki/AjaxTerm) , a web based terminal (CLI). It was totally inspired and works almost exactly like Anyterm.
