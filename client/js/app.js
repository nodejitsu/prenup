
(function() {

    var STR_MAPS = {
        HTML_DECODE: {
            '&lt;': '<'
			,'&gt;': '>'
            ,'&amp;': '&'
            ,'&quot;': '"'
        },
        HTML_ENCODE: {
            '<': '&lt;'
            ,'>': '&gt;'
            ,'&': '&amp;'
            ,'"': '&quot;'
        },
        ESCAPE_CHARSS: {
            '\\': '\\\\',
            '\'': '\\\'',
            '"': '\\"',
            '\r': '\\r',
            '\n': '\\n',
            '\t': '\\t',
            '\f': '\\f',
            '\b': '\\b'
        }
    };

    var jExtras = {

        jup: (function() {

            var Util = {

                isArray: (function() { return Array.isArray || function(obj) {
                    // isArray function adapted from underscore.js
                    return !!(obj && obj.concat && obj.unshift && !obj.callee); 
                }})(),

                sup: function(target, data) {

                    return data ? target.replace(/\{\{([^\{\}]*)\}\}/g, function(str, r) {
                        try { return data[r]; } catch(ex) {}
                    }) : target;
                },

                translate: function (o, data) {

                    var c = [], atts = [], count = 1, selfClosing = false;

                    for (var i in o) {
                        if (o.hasOwnProperty(i) ) {

                            count++;
                            selfClosing = false;

                            if(typeof c[0] == "string") { 
                                switch(o[0].toLowerCase()) {
                                    case "area":
                                    case "base":
                                    case "basefont":
                                    case "br":
                                    case "hr":
                                    case "input":
                                    case "img":
                                    case "link":
                                    case "meta":
                                        selfClosing = true;
                                    break;
                                }                    
                            }

                            if (o[i] && typeof o[i] == "object") {

                                if(!Util.isArray(o[i])) {
                                    for(var attribute in o[i]) {
                                        if (o[i].hasOwnProperty(attribute)) {
                                            atts.push([" ", Util.sup(attribute, data).replace(/ /g, "-"), "=\"", Util.sup(o[i][attribute], data), "\""].join(""));
                                        }
                                    }
                                    c[i] = "";
                                    c[0] = [c[0], atts.join("")].join("");
                                }
                                else {
                                    c[i] = this.translate(o[i], data);
                                }
                            }
                            else {
                                c[i] = Util.sup(o[i], data);
                            }

                            if(typeof c[0] == "string") {

                                c[0] = ["<", o[0], atts.join(""), (selfClosing ? "/>" : ">")].join("");

                                if(selfClosing == false) { 
                                    c.push("</" + o[0] + ">"); 
                                }
                            }
                        }
                    }
                    if(count-1 == o.length) {
                        return [c.join("")];
                    }
                }
            };

            return {
        		version: "0.2",
                data: function(str) {
                    return ["{{", str, "}}"].join("");
                },
                html: function() {

                    var args = Array.prototype.slice.call(arguments), structure = [], data = {};

                    if(args.length == 2) {
                        structure = args[1];
                        data = args[0];
                    }
                    else {
                        if(Util.isArray(args[0])) {
                            structure = args[0];
                        }
                        else {
                            data = args[0].data || null;
                            structure = args[0].structure;
                        }
                    }
                    if(Util.isArray(data)) {

                        var copystack = [];

                        for(var c=0; c < data.length; c++) {
                            copystack.push(Util.translate(structure, data[c])[0]);
                        }
                        return copystack.join("");
                    }
                    else if(data) {
                        for(var d=0; d < data.length; d++) {    
                            return Util.translate(args[2] ? structure : Util.translate(structure)[0], data[d]);
                        }
                    }
                    return Util.translate(structure)[0];
                } 
            };
        })(),
        
        hash: {

            path: function(hash) {

                var hash = window.location.hash;
                return hash.substr(1, hash.length).split("/");    
            }
        },

        querystring: {
            
            toJSON: function(query) {
                /* Special thanks to @bga_ for this bit of code, 
                    a big improvement on my crummy RegEx version */

                query = query || window.location.search;

                var p = 0, 
                    ret = {}, 
                    _unescape = unescape,
                    key,
                    value,
                    queryLen;

                if(query.charAt(p) == '?') {
                    ++p;      
                }
                
                if(query.charAt(p) == '&') {
                    ++p;
                }  

                if(query.charAt(query.length - 1) != '&') {
                    query += '&';
                }

                queryLen = query.length - 1;

                --p;
                while(++p < queryLen) {

                    key = _unescape(query.slice(p, (p = query.indexOf('=', p))));
                    value = _unescape(query.slice(++p, (p = query.indexOf('&', p))));

                    ret[key] = value;
                }
                
                return ret;
            }
        },

        array: {

            group: function(a, callback) {
                
                var len = a.length, groups = [], keys = {};
                for (var i = 0; i < length; i++) {
                    var key = callback(a[i], i);
                    if (! key || !key.length) {
                        continue;
                    }
                    var items = keys[key];
                    if (!items) {
                        items = [];
                        items.key = key;
                        keys[key] = items;
                        groups.add(items);
                    }
                    items.add(a[i]);
                }
                return groups;
            },

            aggregate: function(a, seed, callback) {
                var len = a.length;
                for (var i = 0; i < length; i++) {
                    seed = callback(seed, a[i], i, a);
                }
                return seed;
            },

            removeRange: function(a, index, count) {
                return a.splice(index, count);
            }
        },

        string: {

            html: {

                decode: function(s) {
                    s = s.replace(/(&amp;|&lt;|&gt;|&quot;)/gi,
                    function(_s, r) {
                        return STR_MAPS.HTML_DECODE[r];
                    });
                    return s;
                },

                encode: function(s) {
                    if (/([&<>"])/g.test(s)) {
                        s = s.replace(/([&<>"])/g,
                        function(_s, r) {
                            return STR_MAPS.HTML_ENCODE[r];
                        });
                    }
                    return s;
                }
            },

            quote: function(s) {
                s.replace(new RegExp("([\'\"\\\\\x00-\x1F\x7F-\uFFFF])", "g"),
                function(str, r) {
                    return STR_MAPS.ESCAPE_CHARS[r] || 
						'\\u' + r.charCodeAt(0).toString(16).toUpperCase().padLeft(4, '0');
                });
            },

			subst: function(s, o) {
			    var count = -1;
			    return s.replace(/{{([^{}]*)}}/g,
			        function(str, r) {
			            if(!isNaN(r)) { 
			                return o[r]; 
			            }
			            count++;
			            return o[(o instanceof Array) ? count : r];
			        }
			    );
			}
				
        }
    };

	// put everything under one roof. (assumption that $ is a library that has an extend method (most likely jQuery))
    window.$ = (typeof window.$ != "undefined") ? $.extend($, jExtras) : jExtras;

})();

window.hash = (typeof window.hash != "undefined") ? window.hash : {

	ie:		/MSIE/.test(navigator.userAgent),
	ieSupportBack:	true,
	hash:	document.location.hash,
	
	check:	function () {
		var h = document.location.hash;
		if (h != this.hash) {
			this.hash = h;
			
			this.onHashChanged();
		}
	},
	
	init:	function () {

		// for IE we need the iframe state trick
		if (this.ie && this.ieSupportBack) {
			var frame = document.createElement("iframe");
			frame.id = "state-frame";
			frame.style.display = "none";
			document.body.appendChild(frame);
			this.writeFrame("");
		}

		var self = this;

		// IE
		if ("onpropertychange" in document && "attachEvent" in document) {
			document.attachEvent("onpropertychange", function () {
				if (event.propertyName == "location") {
					self.check();
				}
			});
		}
		// poll for changes of the hash
		window.setInterval(function () { self.check() }, 50);
	},
	
	setHash: function (s) {
		// Mozilla always adds an entry to the history
		if (this.ie && this.ieSupportBack) {
			this.writeFrame(s);
		}
		document.location.hash = s;
	},
	
	getHash: function () {
		return document.location.hash;
	},
	
	writeFrame:	function (s) {
		var f = document.getElementById("state-frame");
		var d = f.contentDocument || f.contentWindow.document;
		d.open();
		d.write("<script>window._hash = '" + s + "'; window.onload = parent.hash.syncHash;<\/script>");
		d.close();
	},
	
	syncHash:	function () {
		var s = this._hash;
		if (s != document.location.hash) {
			document.location.hash = s;
		}
	},
	
	onHashChanged:	function () {}
};

window.APP = (typeof window.APP != "undefined") ? window.APP : {

    overrides: {},

    override: function(ns, plan) {
        overrides[ns] = plan;
    },

    exec: function(params) {

        var strNS = params.ns
            ,self = this
            ,ns = {}
            ,sectors = strNS.split('.')
            ,methods
            ,isArray = (function() { return Array.isArray || function(obj) {
                return !!(obj && obj.concat && obj.unshift && !obj.callee);
            }})();

        var i = 0
            ,len = sectors.length;

        for (i; i < sectors.length; i++) {
            var sector = sectors[i];

            if (i == 0 && !window[sector]) {
                window[sector] = {};
                ns = window[sector];
            }
            else {
                ns = ns[sector] = (ns[sector] ? ns[sector] : {});
            }
        }

        delete this.Main;
        eval(params.ns + " = this;"); // TODO: there may be a better way to do this assignment.

        methods = (typeof APP.overrides[ns] == "undefined") ?
            params.plan : APP.overrides[ns];

        for(method in methods) {

            if(isArray(methods[method])) {

                var params = methods[method].slice(1, methods[method].length)
                    ,i=params.length
                    ,sync = false;

                for(; i>0; i--) {
                    if(params[i] === "sync") {
                        sync = true;
                    }
                }

                sync ? self[methods[method][0]].call(self, params) :
                    (function(method) {
                        setTimeout(function() {
                            self[method[0]].call(self, method.slice(1, method.length));
                        }, 1);
                    })(methods[method]);
            }
            else {

                (function(method) {
                    setTimeout(function() {
                        self[method].call(self);
                    }, 1);
                })(methods[method])
            }
        }
    }
};

/* App Start */

$(function() {

    (function() {

        var options = $.querystring.toJSON();
        var context, DAL, DATA;
        
        return {

               Main: function() {

                   APP.exec.call(this, {

                       ns: "NJ.nup", /* namespace */

                       plan: [ /* execution plan */

                           "pageLoad"
                           ,"determineContext"
                       ]
                });
            },
            
            pageLoad: function() {
                DAL = this.DAL;
                DATA = this.DATA;
                
            },

            determineContext: function() {

                
                
            },
            
            featureDistiller: function() {

                var s/*hit performance, 1:08am */;

                $.each(DATA.features, function(i, feature) {
                    s += $.string.subst("\r\nFeature: {{name}}\r\n\t{{description}}", feature);

                    $.each(feature.scenarios, function(i, scenario) {

                        s += $.string.subst("\r\n\n\tScenario " + (scenario.outline ? "Outline" : "") + ": {{name}}", scenario);

                        $.each(scenario.breakdown, function(i, breakdown) {
                            s += $.string.subst("\r\n\n\t\t" + DAL.get.operatorById(breakdown[0]) + " {{description}}", breakdown);
                        });

                        if(scenario.outline) {

                            $.each(scenario.examples, function(i, example) {

                                s += "\r\n\t\t\t|";

                                $.each(example, function(i, value) {
                                    s += value + "|";
                                });

                                s += "\r\n";

                            });
                        }
                    });
                });

                return s;

            },

            DATA: {

                project: "myProject",
                milestones: ["1", "2"],
                users: {
                    "1": "Joe",
                    "2": "Peter",
                    "3": "Jane"
                },
                features: [

                    "1": {
                        milestone: "1",
                        owner: 1,
                        name: "foo",
                        description: "A Setence",
                        timeunit: "hour",
                        costPerTimeUnit: 80,
                        cost: 150,
                        scenarios: [
                            {
                                outline: false,                                
                                time: [20, "hrs"],
                                description: "blah",
                                breakdown: [
                                    [4, "sentence1"],
                                    [2, "sentence2"],
                                    [1, "sentence3"]
                                ]
                            },
                            {
                                outline: false,
                                time: [20, "hrs"],
                                description: "blah", 
                                brreakdown: [
                                    [4, "sentence1"],
                                    [2, "sentence2"],
                                    [1, "sentence3"]
                                ]
                            }
                        ]
                    },
                    "2": {
                        milestone: "2",
                        owner: 1,
                        name: "bar",
                        description: "A Setence", 
                        timeunit: "hour",
                        costPerTimeUnit: 80,
                        cost: 150,
                        scenarios: [
                            {
                                outline: true,
                                examples: {
                                    "username": ['charlie', 'indexzero'],
                                    "password": ['12345', 'abcde']
                                },
                                time: [20, "hrs"],
                                description: "blah",
                                breakdown: [
                                    [4, "sentence1"],
                                    [2, "sentence2"],
                                    [1, "sentence3"]
                                ]
                            },
                            {
                                outline: false,                                
                                time: [20, "hrs"],
                                description: "blah",
                                brreakdown: [
                                    [4, "sentence1"],
                                    [2, "sentence2"],
                                    [1, "sentence3"]
                                ]
                            }
                        ]
                    }
                ]
            },
            
            DAL: {
                
                get: {
                    get project() {
                        return DATA.project;
                    },
                    get featuresByMilestone(id) {
                        
                    },
                    get scenariosByFeature(id) {
                    },
                    get usersByFeature(id) {
                    },                                        
                    get projectCost(id) {
                    },
                    get operatorsByLanguage() {
                    }
                    get operatorById() {
                        
                    }                    
                },

                set: {
                    set user(config) {
                        if(config.id) {
                            DATA.users[config.id] = config.name;
                        }
                        else {
                            DATA.users[Math.floor(Math.random()*2e9)] = config.name;
                        }                        
                    },
                    set project(config) {
                        if(config.id) {
                            
                        }
                        else {
                            
                        }
                    },
                    set milestone(config) {
                        if(config.id) {
                            
                        }
                        else {
                            
                        }
                    },
                    set scenarios(config) {
                        if(config.id) {
                            
                        }
                        else {
                            
                        }                        
                    }
                }
            }
        
            
        
        
        }
        
    })().Main(); 
});