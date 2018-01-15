/**
 *  libzooqle is a module for ecmascript
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



/*
 * JavaScript uses prototypes and does't have classes (or methods for that matter) like Object Oriented languages.
 * JavaScript developer need to think in JavaScript.
 *  Wikipedia quote:
 *  Unlike many object-oriented languages, there is no distinction between a function definition and a method definition.
 *  Rather, the distinction occurs during function calling; when a function is called as a method of an object,
 *  the function's local this keyword is bound to that object for that invocation.
 */
var Zooqle = (function () {

    var _BASE_URL = 'https://zooqle.com';

    var _OPTIONS = { http_req_callback: undefined, // http request callback
                     dom_callback: undefined,      // must return a dom object from an html string
                     debug : false,
                     debug_callback : console.log
                   };


    /* construct */
    function Zooqle(options) {

        if (options === Object(options) && Object.prototype.toString.call(options) !== '[object Array]') {
            this.options = function () {
                return  { http_req_callback : options.http_req_callback ? options.http_req_callback : _OPTIONS.http_req_callback,
                          dom_callback: options.dom_callback ? options.dom_callback : _OPTIONS.dom_callback,
                          debug : options.debug ? options.debug : _OPTIONS.debug,
                          debug_callback : options.debug_callback ? options.debug_callback : console.log
                        };
            }
        }


        // getter for base url
        this.baseUrl = function () {
            return  _BASE_URL;
        }

    }


    /******* Methods ********/

    /*
     * Private method Debug
     */
    function _debug(e, t) {
        //var err = e.toString().replace('\n', ' >> ');
        if(this.options().debug) this.options().debug_callback(e, t);
    }


    /*
     *  Set init
     *  Sets the doc variable with content of a requested url.
     *  Sets the dom variable with content of a requested url.
     *  The content is a string.
     */
    Zooqle.prototype.init = function (path) {
        if(path === undefined) path = '/';
        this.set_doc(path);
        this.set_dom();
    };


    /*
     *  Set doc
     *  Sets the doc variable with content of a requested url.
     *  The content is a string.
     */
    Zooqle.prototype.set_doc = function (path) {
        if(path === undefined) path = '/';
        this.doc = this.options().http_req_callback(this.baseUrl() + path).toString();
    };


    /*
     *  Get doc
     *  Retruns a string of the content of variable doc
     */
    Zooqle.prototype.get_doc = function() {
        return this.doc;
    };


    /*
     *  Set dom
     *  Sets the dom variable with content of a requested url.
     *  The content is a object.
     */
    Zooqle.prototype.set_dom = function() {
        this.dom = this.options().dom_callback(this.doc);
    };


    /*
     *  Get dom
     *  Retruns a dom object
     */
    Zooqle.prototype.get_dom = function() {
        return this.dom;
    };


    /*
     *  Categories
     *  Returns an array of categories parsed from top menu. Each element of the array is an object.
     *  { title: title, path: path }
     */
    Zooqle.prototype.categories = function() {

        var res = false;

        try {
            var categories = this.dom.root.getElementById('catMenu').getElementByClassName('dropdown');
            res = categories.map(function (value, index, array) {
                return  { title: value.getElementByClassName('dropdown-header')[0] ? value.getElementByClassName('dropdown-header')[0].textContent : "",
                          path: value.getElementByTagName('a')[0] && value.getElementByTagName('a')[0].attributes.getNamedItem('href') ? value.getElementByTagName('a')[0].attributes.getNamedItem('href').value : ''
                        };
            });
        }
        catch (e) {
            _debug.call(this, 'Zooqle.prototype.categories >> ' + e.stack );
        }

        return res;

    };


    /*
     *  Genres
     *  Returns an array of genres of a cagegory. Each element of the array is an object.
     *  { title: title, path: path }
     */
    Zooqle.prototype.genres = function(path) {

        var res = false;

        try {
            var genre = this.dom.root.getElementById('movheader').getElementByTagName('tbody')[0].getElementByTagName('tr')[0].getElementByTagName('td')[0].getElementByTagName('select')[0].getElementByTagName('option');
            res = genre.map(function (value, index, array) {
                var href = '';
                if(value.textContent == 'All genres') href = '?pg=';
                else {href = value.attributes.getNamedItem('value').value + '/?age=any&s=nm&sd=a&tg=0&pg='; }
                return  { title: value ? value.textContent : "",
                          path: path && href ? path + href  : ''
                        };
            });
        }
        catch (e) {
            _debug.call(this, 'Zooqle.prototype.genre >> ' + e.stack );
        }

        return res;

    };



    /*
     *  Pills  (only alphabet for now)
     *  Returns an array of pills of a cagegory. Each element of the array is an object.
     *  { title: title, path: path }
     */
    Zooqle.prototype.pills = function() {

        var res = false;

        try {
            var pills = this.dom.root.getElementById('movheader').getElementByTagName('tbody')[0].getElementByTagName('tr')[1].getElementByTagName('td')[0].getElementByTagName('ul')[0].getElementByTagName('li');
            // pills.shift();

            res = pills.map(function (value, index, array) {

               var title =  value.getElementByTagName('a')[0] ? value.getElementByTagName('a')[0].textContent : "Title not available";
               title = index == 0 ? 'All' : title;
               var path =   value.getElementByTagName('a')[0] && value.getElementByTagName('a')[0].attributes.getNamedItem('href') ? value.getElementByTagName('a')[0].attributes.getNamedItem('href').value : '';
               //path = index == 0 ? path + '?s=nm&sd=a&pg=': path + '&pg=';
               path = index == 0 ? path + '?s=nm&sd=a&pg=': path + '&pg=';

               return  { title: title,
                         path: path
                       };

            });
        }
        catch (e) {
            _debug.call(this, 'Zooqle.prototype.pills >> ' + e.stack );
        }

        return res;

    };


    /*
     *  Files
     *  Returns an array of files for the show. Each element of the array is an object.
     *  { title: title, description: description, path: path }
     */
    Zooqle.prototype.files = function() {

        var res = false;

        try {
            var files = this.dom.root.getElementByClassName('table-torrents')[0].getElementByTagName('tbody')[0].getElementByTagName('tr');
            res = files.map(function (value, index, array) {
                var description = value.getElementByTagName('td')[2] ? value.getElementByTagName('td')[2].textContent : '';
                description = description && value.getElementByTagName('td')[3] ? ' - ' + value.getElementByTagName('td')[3].textContent : description;
                description = description && value.getElementByTagName('td')[5] && value.getElementByTagName('td')[5].getElementByTagName('div')[0] && value.getElementByTagName('td')[5].getElementByTagName('div')[0].attributes.getNamedItem('title') ? value.getElementByTagName('td')[5].getElementByTagName('div')[0].attributes.getNamedItem('title').value : description + 'Seeders: 0 | Leechers: 0';
                return  { title: value.getElementByTagName('td')[1] ? value.getElementByTagName('td')[1].textContent : 'Title not available' ,
                          description :  description,
                          path: value.getElementByTagName('td')[1] && value.getElementByTagName('td')[1].getElementByTagName('a')[0] && value.getElementByTagName('td')[1].getElementByTagName('a')[0].attributes.getNamedItem('href') ? value.getElementByTagName('td')[1].getElementByTagName('a')[0].attributes.getNamedItem('href').value : ''
                        };
                });
        }
        catch(e) {
            _debug.call(this, 'Zooqle.prototype.files >> ' + e.stack );
        }

        return res;

    }


    /*
     *  Shows
     *  Returns an array of shows for the genre. Each element of the array is an object.
     *  {title: title, icon: icon, path: path, quality: quality, genre: genre, description: description }
     *  Below are not implemented yet
     *  year: year,
     *  season: Season number of TV Show.
     *  episode: Episode number of TV Show.
     *  duration: time,
     *  background: background
     */
    Zooqle.prototype.shows = function() {

        var res = false;
        var base = this.baseUrl();

        try {
            var lines = this.dom.root.getElementById('movpanel').getElementByClassName('panel-body')[0].getElementByClassName('table')[0].getElementByTagName('tbody')[0].getElementByTagName('tr');
            res = lines.map(function (value, index, array) {

                 var title = value.getElementByTagName('td')[2] && value.getElementByTagName('td')[2].getElementByTagName('a')[0] ? value.getElementByTagName('td')[2].getElementByTagName('a')[0].textContent : 'Title not found';
                 title = title && value.getElementByTagName('td')[4] && value.getElementByTagName('td')[4].getElementByTagName('span')[0] ? title + ' - ' + value.getElementByTagName('td')[4].getElementByTagName('span')[0].textContent : title;
                 title = title && value.getElementByTagName('td')[5] ? title + ' - ' + value.getElementByTagName('td')[5].textContent + ' files' : title;

                 return  { title: title,
                           icon: value.getElementByTagName('td')[1] && value.getElementByTagName('td')[1].getElementByTagName('a')[0] && value.getElementByTagName('td')[1].getElementByTagName('a')[0].getElementByTagName('img')[0] && value.getElementByTagName('td')[1].getElementByTagName('a')[0].getElementByTagName('img')[0].attributes.getNamedItem('src') ? base + value.getElementByTagName('td')[1].getElementByTagName('a')[0].getElementByTagName('img')[0].attributes.getNamedItem('src').value : '',
                           path: value.getElementByTagName('td')[1] && value.getElementByTagName('td')[1].getElementByTagName('a')[0] && value.getElementByTagName('td')[1].getElementByTagName('a')[0].attributes.getNamedItem('href') ? value.getElementByTagName('td')[1].getElementByTagName('a')[0].attributes.getNamedItem('href').value : '',
                           quality: value.getElementByTagName('td')[4] && value.getElementByTagName('td')[4].getElementByTagName('span')[0]   ? value.getElementByTagName('td')[4].getElementByTagName('span')[0].textContent : '',
                           genre: value.getElementByTagName('td')[2] && value.getElementByTagName('td')[2].getElementByClassName('mov_info')[0] ? value.getElementByTagName('td')[2].getElementByClassName('mov_info')[0].textContent : 'Generic',
                           description : value.getElementByTagName('td')[2] && value.getElementByTagName('td')[2].getElementByClassName('mov_descr')[0] ? value.getElementByTagName('td')[2].getElementByClassName('mov_descr')[0].textContent : 'No description found'
                           //year: year,
                           //season: Season number of TV Show.
                           //episode: Episode number of TV Show.
                           //duration: time,
                           //background: background
                         };
            });
        }
        catch(e) {
            _debug.call(this, 'Zooqle.prototype.shows >> ' + e.stack );
        }

        return res;

    };


    /*
     *  Seasons
     *  Returns an array of seasons for the show. Each element of the array is an object.
     *  { title: title, episodes: { title: title, path: path } }
     */
    Zooqle.prototype.seasons = function() {

        var res = false;

        try {
            var seasons = this.dom.root.getElementById('accordion').getElementByClassName('panel');

            res = seasons.map(function (value, index, array) {

                var title =  value.getElementByClassName('panel-heading')[0] &&  value.getElementByClassName('panel-heading')[0].getElementByTagName('a')[0] ? value.getElementByClassName('panel-heading')[0].getElementByTagName('a')[0].textContent : 'No totle found';
                title =  title && value.getElementByClassName('panel-heading')[0] &&  value.getElementByClassName('panel-heading')[0].getElementByTagName('span')[0] ? title + ' ' + value.getElementByClassName('panel-heading')[0].getElementByTagName('span')[0].textContent : title;

                var eps = {};
                if(value.getElementByClassName('panel-collapse')[0] && value.getElementByClassName('panel-collapse')[0].getElementByTagName('div')[0]
                     && value.getElementByClassName('panel-collapse')[0].getElementByTagName('div')[0].getElementByTagName('ul')[0] 
                     && value.getElementByClassName('panel-collapse')[0].getElementByTagName('div')[0].getElementByTagName('ul')[0].getElementByTagName('li') ) {

                     eps = value.getElementByClassName('panel-collapse')[0].getElementByTagName('div')[0].getElementByTagName('ul')[0].getElementByTagName('li').map(function (value2, index2, array2) {

                         // find title
                         var a_tags = value2.getElementByTagName('a') ? value2.getElementByTagName('a') : false;
                         var ep_title = false;
                         var ep_path = '';
                         var ep_files_nr = value2.getElementByTagName('span')[0] ? value2.getElementByTagName('span')[0].textContent : '0';
                         var ep_nr = value2.getElementByClassName('epnum')[0] ? value2.getElementByClassName('epnum')[0].textContent : '*';

                         if(a_tags){
                             for(a in a_tags) {
                                 if (a_tags[a].attributes.getNamedItem('data-toggle') && a_tags[a].attributes.getNamedItem('data-toggle').value == 'collapse'){
                                     ep_title = ep_nr + ' - ' + a_tags[a].textContent + ' - '+ ep_files_nr + ' files';
                                 }
                             }
                         }

                         if(!ep_title) ep_title =  value2.getElementByTagName('span')[1] ? new showtime.RichText('<font color="EE0000">'+value2.getElementByTagName('span')[1].textContent+'</font>') : new showtime.RichText('<font color="EE0000">'+'Title not found'+'</font>');

                         return { title: ep_title,
                                  path:  value2.getElementByClassName('epdiv')[0] && value2.getElementByClassName('epdiv')[0].attributes.getNamedItem('data-href') ? value2.getElementByClassName('epdiv')[0].attributes.getNamedItem('data-href').value : ''
                                };

                     });

                }

                return  {
                          title : title,
                          episodes : eps
                        };

            });

        }
        catch(e) {
            _debug.call(this, 'Zooqle.prototype.seasons >> ' + e.stack );
        }

        return res;

    };


    /*
     *  Results
     *  Returns an array of results
     *  [string, int]
     *  Nota: sarebbe da implementare: se ritorna 0, allora dovremmo contare gli elementi dentro il li, cambiare poi sotto la fuzione load
     *
     */
    Zooqle.prototype.results = function() {

       var res = ['0 results', 0];
       try {

           var pagination = false;

           if(this.dom.root.getElementById('movpanel')) {
               pagination = this.dom.root.getElementById('movpanel').getElementByClassName('panel-body')[0].getElementByClassName('pagination')[0];
           }
           else {  // search page
                if(this.dom.root.getElementByClassName('zq-small')) pagination = this.dom.root.getElementByClassName('zq-small')[0].getElementByClassName('panel-body')[0].getElementByClassName('pagination')[0];
           }

           var list = pagination.getElementByTagName('li');
           res = [list[list.length - 1].textContent, parseInt(list[list.length - 1].textContent.toString().replace(' results','').replace(',',''))];

        }
        catch (e) {
            _debug.call(this, 'Zooqle.prototype.results >> ' + e.stack );
        }

        return res;

    };


    /*
     *  Magnet
     *  Returns the magnet link
     *  [string]
     */
    Zooqle.prototype.magnet = function() {

        var magnet = false;

        try {
            magnet = this.doc.match(/magnet:\?([^"]+)/); //"
            magnet = 'magnet:?' + magnet[1];
        }
        catch(e) {
            _debug.call(this, 'Zooqle.prototype.magnet >> ' + e.stack );
        }

        return unescape(magnet);

    }


    /*
     *  Torrent
     *  Returns the torrent link
     *  [string]
     */
    Zooqle.prototype.torrent = function() {
        var torrent = false;

        try {
            torrent = this.doc.match(/<a rel="nofollow" href="\/download\/([^"]+)/);
            torrent = this.baseUrl() + '/download/' + unescape(torrent[1]);
        }
        catch(e) {
            _debug.call(this, 'Zooqle.prototype.torrent >> ' + e.stack );
        }

        return unescape(torrent);

    }


    return Zooqle;

})();


module.exports = Zooqle;
