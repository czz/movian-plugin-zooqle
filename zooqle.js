/**
 * zooqle.tv plugin for Movian Media Center
 *
 *  Copyright (C) 2017 czz78
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var html = require('showtime/html');
var Zooqle = require('./libs/libzooqle');


(function(plugin) {

    var logo = plugin.path + "logo.png";

    function trim(s) {
        return s.replace(/(\r\n|\n|\r)/gm, "").replace(/(^\s*)|(\s*$)/gi, "").replace(/[ ]{2,}/gi, " ").replace(/\t/, '');
    }

    var blue = '6699CC', orange = 'FFA500', red = 'EE0000', green = '008B45' , dark_green='43db43';

    function coloredStr(str, color) {
        return '<font color="' + color + '">' + str + '</font>';
    }

    function setPageHeader(page, title) {
        if (page.metadata) {
            page.metadata.title = title;
            page.metadata.logo = logo;
        }
        page.type = "directory";
        page.contents = "items";
        //if (!logged) loginAndGetConfig(page, false);
        page.loading = false;
    }

    function toUTF8(str){
        output = "";
        try {
            /* From ISO-8859-1 to UTF-8 */
            output = new String(str.getBytes("ISO-8859-1"), "UTF-8");
        } catch (e) {
            return str;
        }
        return output;
    }

    function tryJSONDecode(str) {
        var output;
        try {
            output = showtime.JSONDecode(str);
        } catch (e) {
            showtime.print("JSONDECODE: " + str);
            return false;
        }
        return output;
    }

    function tryHttpReq(url) {
        var doc="";
        try {
            doc = showtime.httpReq(url);
        } catch (e) {
            showtime.print("Could Not Retrieve: " + url);
            return false;
        }
        return doc;
    }

    function loginAndGetConfig(page, showDialog) {
        var text = '';
        if (showDialog) {
            text = '';
            logged = false;
        }

        /* Here goes code for login and config*/
    }


    // Istances
    var service = plugin.createService(plugin.getDescriptor().id, plugin.getDescriptor().id + ":start", "video", true, logo);
    var zql = new Zooqle({
                          http_req_callback: showtime.httpReq,
                          dom_callback: html.parse,
                          debug : true,
                          debug_callback: showtime.trace
                        });


    /* not need it */
    plugin.addURI(plugin.getDescriptor().id + ":zooqle:(.*):(.*)", function(page, title, path) {

        page.loading = true;

        no_subtitle_scan = true;

        page.type = 'video';

        page.source = "videoparams:" + showtime.JSONEncode({
            title: title,
            canonicalUrl: plugin.getDescriptor().id + ':zooqle:' + title + ':' + path,
              sources: [{url:  path}],
            no_subtitle_scan: no_subtitle_scan
        });
        page.loading = false;

    });


    /*
     *  Search bar
     *  It redirects for search files
     */
    plugin.addURI(plugin.getDescriptor().id + ":zooqlesearch:(.*)", function(page, query) {
        var path= '/search?q=' + query;
        page.redirect(plugin.getDescriptor().id + ":zooqlefiles:Search for " + query + ":" + path );
    });


    /*
     *  Download page
     *  It shows files that can be downloaded throw torrent
     */
    plugin.addURI(plugin.getDescriptor().id + ":zooqledownload:(.*):(.*)", function(page, title, path) {

        setPageHeader(page, title);

        page.loading = true;
        zql.init(path + '?v=t');
        no_subtitle_scan = true;

        var magnet_url=zql.magnet();
        if(magnet_url) {
            page.appendItem( 'torrent:browse:'+ magnet_url , 'directory', {
                title: 'Magnet: '+ title
            });
        }

        var torrent_url = zql.torrent();
        if(torrent_url) {
            page.appendItem( 'torrent:browse:'+ torrent_url , 'directory', {
                title: 'Torrent File: '+ title
            });
        }

        page.loading = false;

    });


    /*
     *  Files page
     *  It shows files for a category genre
     */
    plugin.addURI(plugin.getDescriptor().id + ":zooqlefiles:(.*):(.*)", function(page, title, path) {

        setPageHeader(page, unescape(title));

        var total_results;
        var page_number = 1, total_results , try_to_load = true, count_shows=0;
        page.entries = 0;


        page.loading = true;


        function loader() {

            if(!try_to_load){ return false; }

            if(path.match( /search\?q=/)) { // if search page
                zql.init(path + '&pg='+ page_number);
            }
            else {
                zql.init(path + '?v=t'+ '&pg=' +page_number);
            }


            total_results = zql.results();

            // print files if there are any ( this searches for movies files
            var files= zql.files();
            if(files) {
                count_shows = count_shows +  files.length;
                for (var i in files) {
                    page.appendItem(plugin.getDescriptor().id + ':zooqledownload:'+ files[i].title +':' + files[i].path , 'file', {
                        title: files[i].title
                    });
                }
            }

            // print seasons and episodes if there are any
            var seasons= zql.seasons();
            if(seasons) {
                for (var i in seasons) {
                    page.appendItem(null,'separator', { title:seasons[i].title });
                    for(var k in seasons[i].episodes) {
                        page.appendItem(plugin.getDescriptor().id + ':zooqlefiles:'+ seasons[i].episodes[k].title +':' + seasons[i].episodes[k].path , 'file', seasons[i].episodes[k]);
                    }
                    count_shows = count_shows +  seasons[i].episodes.length;
                 }
             }

             if((count_shows) >= total_results[1]) {
                 try_to_load = false;
                 total_results[1] = count_shows;
             }

             setPageHeader(page, new showtime.RichText(coloredStr(title + ' ('+count_shows+'/'+total_results[1]+'  results)', blue)));

             page.entries++;
             page_number++;

             return true;

        }

        loader();
        page.loading = false;
        page.paginator = loader;

    });


    /*
     *  Shows page
     *  It shows shows: it could be a movie, tv seasons, or other files
     *  Redirects to retrive files to the right places
     */
    plugin.addURI(plugin.getDescriptor().id + ":zooqleshows:(.*):(.*)", function(page, title, path) {

        setPageHeader(page, new showtime.RichText(coloredStr(title, blue)));

        var page_number = 1, total_results , try_to_load = true, count_shows=0;
        page.entries = 0;
        page.loading = true;

        function loader() {

            if(!try_to_load){ return false; }
            page.loading = true;

            try {
                zql.init( path + page_number);
            }
            catch (e) {
                showtime.print(e);
            }

            total_results = zql.results();
            var shows = zql.shows();

            if(shows){
                count_shows = count_shows +  shows.length;
                for (show in shows){
                    page.appendItem( plugin.getDescriptor().id + ':zooqlefiles:'+ escape(shows[show].title) + ':' +  shows[show].path , "video", shows[show] );
                }

            }
            if((count_shows) >= total_results[1]) {
                try_to_load = false;
                total_results[1] = count_shows;
            }

            setPageHeader(page, new showtime.RichText(coloredStr(title + ' ('+count_shows+'/'+total_results[1]+'  results)', blue)));

            page.entries++;
            page_number++;

            return true;

        }

        loader();
        page.loading = false;
        page.paginator = loader;

    });


    /*
     *  Pills page
     *  It shows pills for a category genre
     */
    plugin.addURI(plugin.getDescriptor().id + ":zooqlepills:(.*):(.*)", function(page, title, path) {

        setPageHeader(page, new showtime.RichText(coloredStr(title, blue)));
        page.loading = true;

        zql.init(path);
        var pills= zql.pills();

        if(pills){
            for (var i in pills) {
                // replace path
                path = path.match(/\?(.*)/) ? path.replace('?'+path.match(/\?(.*)/)[1], '') : path;
                page.appendItem(plugin.getDescriptor().id + ':zooqleshows:'+ pills[i].title +':' + path + pills[i].path , 'directory', pills[i]);
                setPageHeader(page, title + ' ('+i.toString()+' results)');
            }
        }

        page.loading = false;

    });


    /*
     *  Second page
     *  It shows the genres menu for a category and redirects to pills if founded
     */
    plugin.addURI(plugin.getDescriptor().id + ":zooqlegenres:(.*):(.*)", function(page, title, path) {

        setPageHeader(page,new showtime.RichText(coloredStr(title, blue)));
        page.loading = true;

        zql.init(path);
        var genres = zql.genres(path);
        var pills = zql.pills();

        if(genres) {
            for (var i in genres) {
                if(pills) {
                    page.appendItem(plugin.getDescriptor().id + ':zooqlepills:'+ genres[i].title +':' + genres[i].path , 'directory', genres[i]);
                }
                else {
                    page.appendItem(plugin.getDescriptor().id + ':zooqleshows:'+ genres[i].title +':' + genres[i].path  , 'directory', genres[i]);
                }
            }

            setPageHeader(page,new showtime.RichText(coloredStr(title + ' ('+ i.toString()+ ' results)', blue)));

        }

        page.loading = false;

    });


    /*
     *  First page
     *  It shows the categories menu
     */
    plugin.addURI(plugin.getDescriptor().id + ":start", function(page) {

        setPageHeader(page, new showtime.RichText(coloredStr('Zooqle', blue)));
        page.loading = true;


        page.appendItem(plugin.getDescriptor().id + ":zooqlesearch:", 'search', {
            title: "Search on zooqle"
        });

        page.appendItem(null,'separator',{title:new showtime.RichText(coloredStr('Categories', blue))});

        zql.init();
        var categories= zql.categories();

        if(categories) {
            for (var i in categories) {
                page.appendItem(plugin.getDescriptor().id + ':zooqlegenres:'+ categories[i].title +':' + categories[i].path , 'directory', categories[i] );
            }
        }

        page.appendItem(null,'separator',{title:new showtime.RichText(coloredStr('TV Popular', blue))});

        page.loading = false;
    });


})(this);
