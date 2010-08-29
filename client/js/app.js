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
              
                // load up the milestones
                
                var html = [];

                $.each(DAL.get.milestones(), function(key, milestone) {
                    html.push($.jup.html([
                        ["input", { "class": "btn", "id": "ms" + key, "type": "checkbox" }], 
                        ["label", { "for": "ms" + key }, milestone]
                    ]));
                });

                $("#toolbar").html(html.join(""));
                $("#toolbar .btn").button();

                // load up the features/scenarios/breakdowns/steps/operators etc.

                html = [];

                $.each(DAL.get.features(), function(i, feature) {
                    html.push($.jup.html([
                        ["h3", { "class": "ms" + feature.milestone },
                            ["a", { "href": "#" }, feature.name]
                        ],
                        ["div", { "class": "ms" + feature.milestone },

                            (function() {

                                var scenarios = [];

                                $.each(feature.scenarios, function(key, scenario) {
                                    scenarios.push($.jup.html(["div", { "class": "scenario" },

                                        ["h3", { "class": "breakdown" }, 
                                            ["a", { "href": "#" }, scenario.name]
                                        ],
                                        ["div",
                                            (function() {

                                                var breakdown = ["<ul class='sortable-ui'>"];

                                                $.each(scenario.breakdown, function(key, step) {
                                                    $.each(step, function(key, pair) {
                                                        breakdown.push($.jup.html(["li",
                                                        ["span", { "class": "ui-icon ui-icon-arrowthick-2-n-s grip" }],
                                                            ["select", [

                                                                (function() {

                                                                    var options = [];
                                                                    var v = 0;
                                                                    $.each(DAL.get.operators(), function(i, operator) {
                                                                        v = v +1
                                                                        options.push($.jup.html(["option" + (pair[0] == operator ? " selected" : ""), operator]));
                                                                        
                                                                      
                                                                    });
                                                                    return options;
                                                                                                 
                                                                })()
                                                            ]],
                                                            ["input", { "type": "text", "value": pair[1] },
                                                            ["span", { "class": "ui-icon ui-icon-circle-close grip" }],
                                                             ["br"]]
                                                        ]));
                                                    });
                                                });

                                                breakdown.push("</ul>");

                                                return breakdown.join("");

                                            })()
                                        ]

                                    ]));
                                });

                                return scenarios.join("");

                            })()
                        ]
                    ]));                    
                });
                
                $("#featureslist").html(html.join(""));
                $("#featureslist, .scenario").accordion({ collapsible: true, autoHeight: false });
                $('.sortable-ui').sortable();
                
                
                
            },

            determineContext: function() {

                
                
            },
            
            featureDistiller: function() {

                var s = ""/*hit performance, 1:08am */;

                $.each(DATA.features, function(i, feature) {
                    s += $.string.subst("Feature: {{name}}\r\n\t{{description}}", feature);

                    $.each(feature.scenarios, function(i, scenario) {
                     
                        s += $.string.subst("\r\n\n\tScenario " + (scenario.outline ? "Outline" : "") + ": {{name}}", scenario);

                        $.each(scenario.breakdown, function(key, breakdown) {

                            $.each(breakdown, function(i, motive) {
                                s += $.string.subst("\r\n\t\t" + motive[0] + " " + motive[1]);
                            });
                        });
                        
                        if(scenario.outline) {
                            
                            s+="\r\n\r\n\t\tExamples:\r\n";
                            var cols = [], len = 0, arrLen = 0;
                            

                            // determine max column width for each column
                            $.each(scenario.examples, function(i, example) {
                              if(example.length > arrLen){
                                arrLen = example.length;
                              }
                             
                                $.each(example, function(n) {
                                    if(typeof cols[n] == 'undefined'){
                                      cols[n] = 0;
                                    }
                                    if(example[n].length > cols[n]){
                                      cols[n] = example[n].length;
                                    }    
                                });
                            });

                            
                            $.each(scenario.examples, function(i, example) {
                                s += "\t\t\t";
                                s += " | "
                                s += i;
                            });
                            s += "\r\n";
                            
                            for(var x = 0; x < arrLen; x++){
                              $.each(scenario.examples, function(i, example) {
                                s += "\t\t\t";
                                s += " | "
                                s += scenario.examples[i][x] || '';
                              });
                              s += "\r\n";  
                            }
                        }                        
                    });
                    
                    s += "\r\n\n"
                });

                return s;

            },

            DATA: { // dummy-data, this would be replaced by loaded data.

                language: "en",
                project: "myProject",
                milestones: {
                    "1": "First", 
                    "2": "Second"
                },
                users: {
                    "1": "Joe",
                    "2": "Peter",
                    "3": "Jane"
                },
                features: {

                    "1": {
                        milestone: 1,
                        owner: 1,
                        users: [2, 3],
                        name: "foo",
                        description: "A Setence",
                        timeunit: "hour",
                        costPerTimeUnit: 80,
                        scenarios: [
                            {
                                id: 0,                                
                                outline: false,                                
                                time: 20,
                                name: "scenario0",
                                description: "blah",
                                breakdown: [
                                    {"1": ["examples", "sentence1"]},
                                    {"2": ["name", "sentence2"]},
                                    {"3": ["and", "sentence3"]}
                                ]
                            },
                            {
                                id: 1,                                
                                outline: false,
                                time: 20,
                                name: "scenario1",                                
                                description: "blah",
                                breakdown: [
                                    {"1": ["and", "sentence1"]},
                                    {"2": ["background", "sentence2"]},
                                    {"3": ["when", "sentence3"]}
                                ]
                            }
                        ]
                    },
                    "2": {
                        milestone: 2,
                        owner: 1,
                        users: [2, 3],
                        name: "bar",
                        description: "A Setence", 
                        timeunit: "hour",
                        costPerTimeUnit: 80,
                        time: 5,
                        scenarios: [
                            {
                                id: 2,                                
                                outline: true,
                                examples: {
                                    "username": ['charlie', 'indexzero', 'shit'],
                                    "password": ['12345', 'abcde']
                                },
                                time: 20,
                                name: "scenario2",                                
                                description: "blah",
                                breakdown: [
                                    {"1": ["when", "sentence1"]},
                                    {"2": ["and", "sentence2"]},
                                    {"3": ["where", "sentence3"]}
                                ]
                            },
                            {
                                id: 3,
                                outline: false,                                
                                time: 20,
                                name: "scenario3",                                
                                description: "blah",
                                breakdown: [
                                    {"1": ["background", "sentence1"]},
                                    {"3": ["where", "sentence2"]},
                                    {"2": ["and", "sentence3"]}
                                ]
                            }
                        ]
                    }
                }
            },

            DAL: {

                get: {

                    project: function() {
                        return DATA.project;
                    },
                    milestones: function() {
                        return DATA.milestones;
                    },
                    features: function() {
                        return DATA.features;
                    },
                    featuresByMilestone: function(id) {
                        
                        var features = [];

                        $.each(DATA.features, function(i, feature) {
                            if(feature.milestone == id) {
                                features.push(feature);
                            }
                        });

                        return features;
                    },
                    scenariosByFeature: function(id) {
                        return DATA.features[id].scenarios;
                    },
                    usersByFeature: function(id) {
                        
                        var users = [];
                        
                        $.each(DATA.features[id].users, function(i, o) {
                            var user = {};
                            user[i] = DATA.users[o];
                            users.push(user);
                        });
                        
                        return users;
                    },
                    breakdownByFeature: function(id) {
                        return DATA.features[id].breakdown;
                    },
                    projectCost: function(id) {
                        
                        var cost = 0;
                        
                        $.each(DATA.features, function(key, feature) {
                            
                            var time = 0;
                            
                            $.each(feature.scenarios, function(i, scenario) {
                                time += scenario.time;
                            });
                            
                            cost = feature.costPerTimeUnit * time;
                        });
                        
                        return cost;

                    },
                    languages: function() {
                        var languages = [];
                        
                        $.each(GERK.i18n, function(k, o) {
                            languages.push(k);
                        });
                        
                        return languages;
                    },
                    operators: function() {

                        return {

                            and: GERK.i18n[DATA.language]["and"]
                            ,but: GERK.i18n[DATA.language]["but"]
                            ,given: GERK.i18n[DATA.language]["given"]
                            ,when: GERK.i18n[DATA.language]["when"]
                            ,then: GERK.i18n[DATA.language]["then"]
                        };

                    },
                    operatorById: function(id) {
                        return GERK.i18n[DATA.language][id];
                    },
                    language: function() {
                        return DATA.language;
                    }     
                },

                set: {

                    user: function (config) {
                        if(config.id) {

                            if(config.name) {
                                DATA.users[config.id] = config.name;
                            }

                            if(config.add) {

                                $.each(config.features, function(key, feature) {

                                    var users = DATA.features[feature].users;

                                    if(_.indexOf(users, config.id) != -1) {
                                         users = _.without(users, config.id);
                                    }

                                    DATA.features[feature].users.push(config.id);

                                });
                            }

                            if(config.remove) {

                                var users = DATA.features[feature].users;
                                users = _.without(users, config.id);
                            }
                        }
                        else {
                            DATA.users[Math.floor(Math.random()*2e9)] = config.name;
                        }                        
                    },
                    project: function(name) {
                        DATA.project = name;
                    },
                    milestone: function(config) {
                        DATA.milestones[config.id] = config.name;
                    },
                    scenario: function(config) {
                        if(config.id) {

                            if(config.update) {
                                $.each(DATA.features[config.id].scenarios, function(i, scenario) {
                                    scenario[config.update.id] = value;
                                });
                            }
                            if(config.create) {
                                DATA.features[config.id].scenarios.push({
                                    id: Math.floor(Math.random()*2e9),
                                    outline: false,
                                    examples: null,
                                    time: 20,
                                    description: "blah",
                                    breakdown: [
                                        {1: ["when", "something happens"]}
                                    ]
                                });                                
                            }
                        }
                    },
                    language: function(id) {
                        DATA.language = id;
                    }
                }
            }
        
        }
        
    })().Main(); 
});


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


var GERK = {};

GERK.i18n = {
    "uk": {
        "examples": "Приклади",
        "feature": "Функціонал",
        "name": "Ukrainian",
        "but": "Але",
        "and": "І|А також|Та",
        "scenario_outline": "Структура сценарію",
        "background": "Передумова",
        "native": "Українська",
        "when": "Якщо|Коли",
        "then": "То|Тоді",
        "given": "Припустимо|Припустимо, що|Нехай|Дано",
        "scenario": "Сценарій"
    },
    "it": {
        "examples": "Esempi",
        "feature": "Funzionalità",
        "name": "Italian",
        "but": "Ma",
        "and": "E",
        "scenario_outline": "Schema dello scenario",
        "background": "Contesto",
        "native": "italiano",
        "when": "Quando",
        "then": "Allora",
        "given": "Dato",
        "scenario": "Scenario"
    },
    "zh-CN": {
        "examples": "例子",
        "feature": "功能",
        "name": "Chinese simplified",
        "but": "但是<",
        "and": "而且<",
        "scenario_outline": "场景大纲",
        "background": "背景",
        "native": "简体中文",
        "when": "当<",
        "then": "那么<",
        "given": "假如<",
        "scenario": "场景"
    },
    "no": {
        "examples": "Eksempler",
        "feature": "Egenskap",
        "name": "Norwegian",
        "but": "Men",
        "and": "Og",
        "scenario_outline": "Abstrakt Scenario",
        "background": "Bakgrunn",
        "native": "norsk",
        "when": "Når",
        "then": "Så",
        "given": "Gitt",
        "scenario": "Scenario"
    },
    "ja": {
        "examples": "例|サンプル",
        "feature": "フィーチャ|機能",
        "name": "Japanese",
        "but": "しかし<|但し<|ただし<",
        "and": "かつ<",
        "scenario_outline": "シナリオアウトライン|シナリオテンプレート|テンプレ|シナリオテンプレ",
        "background": "背景",
        "native": "日本語",
        "when": "もし<",
        "then": "ならば<",
        "given": "前提<",
        "scenario": "シナリオ"
    },
    "fr": {
        "examples": "Exemples",
        "feature": "Fonctionnalité",
        "name": "French",
        "but": "Mais",
        "and": "Et",
        "scenario_outline": "Plan du scénario|Plan du Scénario",
        "background": "Contexte",
        "native": "français",
        "when": "Quand|Lorsque|Lorsqu'<",
        "then": "Alors",
        "given": "Soit|Etant donné",
        "scenario": "Scénario"
    },
    "en-tx": {
        "examples": "Examples",
        "feature": "Feature",
        "name": "Texan",
        "but": "But y'all",
        "and": "And y'all",
        "scenario_outline": "All y'all",
        "background": "Background",
        "native": "Texan",
        "when": "When y'all",
        "then": "Then y'all",
        "given": "Given y'all",
        "scenario": "Scenario"
    },
    "de": {
        "examples": "Beispiele",
        "feature": "Funktionalität",
        "name": "German",
        "but": "Aber",
        "and": "Und",
        "scenario_outline": "Szenariogrundriss",
        "background": "Grundlage",
        "native": "Deutsch",
        "when": "Wenn",
        "then": "Dann",
        "given": "Angenommen|Gegeben sei",
        "scenario": "Szenario"
    },
    "sk": {
        "examples": "Príklady",
        "feature": "Požiadavka",
        "name": "Slovak",
        "but": "Ale",
        "and": "A",
        "scenario_outline": "Náčrt Scenáru",
        "background": "Pozadie",
        "native": "Slovensky",
        "when": "Keď",
        "then": "Tak",
        "given": "Pokiaľ",
        "scenario": "Scenár"
    },
    "hu": {
        "examples": "Példák",
        "feature": "Jellemző",
        "name": "Hungarian",
        "but": "De",
        "and": "És",
        "scenario_outline": "Forgatókönyv vázlat",
        "background": "Háttér",
        "native": "magyar",
        "when": "Majd|Ha|Amikor",
        "then": "Akkor",
        "given": "Amennyiben|Adott",
        "scenario": "Forgatókönyv"
    },
    "sv": {
        "examples": "Exempel",
        "feature": "Egenskap",
        "name": "Swedish",
        "but": "Men",
        "and": "Och",
        "scenario_outline": "Abstrakt Scenario",
        "background": "Bakgrund",
        "native": "Svenska",
        "when": "När",
        "then": "Så",
        "given": "Givet",
        "scenario": "Scenario"
    },
    "ru": {
        "examples": "Значения",
        "feature": "Функционал|Фича",
        "name": "Russian",
        "but": "Но|А",
        "and": "И|К тому же",
        "scenario_outline": "Структура сценария",
        "background": "Предыстория",
        "native": "русский",
        "when": "Если|Когда",
        "then": "То|Тогда",
        "given": "Допустим|Дано|Пусть",
        "scenario": "Сценарий"
    },
    "fi": {
        "examples": "Tapaukset",
        "feature": "Ominaisuus",
        "name": "Finnish",
        "but": "Mutta",
        "and": "Ja",
        "scenario_outline": "Tapausaihio",
        "background": "Tausta",
        "native": "suomi",
        "when": "Kun",
        "then": "Niin",
        "given": "Oletetaan",
        "scenario": "Tapaus"
    },
    "es": {
        "examples": "Ejemplos",
        "feature": "Característica",
        "name": "Spanish",
        "but": "Pero",
        "and": "Y",
        "scenario_outline": "Esquema del escenario",
        "background": "Antecedentes",
        "native": "español",
        "when": "Cuando",
        "then": "Entonces",
        "given": "Dado",
        "scenario": "Escenario"
    },
    "zh-TW": {
        "examples": "例子",
        "feature": "功能",
        "name": "Chinese traditional",
        "but": "但是<",
        "and": "而且<|並且<",
        "scenario_outline": "場景大綱|劇本大綱",
        "background": "背景",
        "native": "繁體中文",
        "when": "當<",
        "then": "那麼<",
        "given": "假設<",
        "scenario": "場景|劇本"
    },
    "pt": {
        "examples": "Exemplos",
        "feature": "Funcionalidade",
        "name": "Portuguese",
        "but": "Mas",
        "and": "E",
        "scenario_outline": "Esquema do Cenário|Esquema do Cenario",
        "background": "Contexto",
        "native": "português",
        "when": "Quando",
        "then": "Então|Entao",
        "given": "Dado",
        "scenario": "Cenário|Cenario"
    },
    "ko": {
        "examples": "예",
        "feature": "기능",
        "name": "Korean",
        "but": "하지만<|단<",
        "and": "그리고<",
        "scenario_outline": "시나리오 개요",
        "background": "배경",
        "native": "한국어",
        "when": "만일<|만약<",
        "then": "그러면<",
        "given": "조건<|먼저<",
        "scenario": "시나리오"
    },
    "et": {
        "examples": "Juhtumid",
        "feature": "Omadus",
        "name": "Estonian",
        "but": "Kuid",
        "and": "Ja",
        "scenario_outline": "Raamstsenaarium",
        "background": "Taust",
        "native": "eesti keel",
        "when": "Kui",
        "then": "Siis",
        "given": "Eeldades",
        "scenario": "Stsenaarium"
    },
    "uz": {
        "examples": "Мисоллар",
        "feature": "Функционал",
        "name": "Uzbek",
        "but": "Лекин|Бирок|Аммо",
        "and": "Ва",
        "scenario_outline": "Сценарий структураси",
        "background": "Тарих",
        "native": "Узбекча",
        "when": "Агар",
        "then": "Унда",
        "given": "Агар",
        "scenario": "Сценарий"
    },
    "id": {
        "examples": "Contoh",
        "feature": "Fitur",
        "name": "Indonesian",
        "but": "Tapi",
        "and": "Dan",
        "scenario_outline": "Skenario konsep",
        "background": "Dasar",
        "native": "Bahasa Indonesia",
        "when": "Ketika",
        "then": "Maka",
        "given": "Dengan",
        "scenario": "Skenario"
    },
    "en-Scouse": {
        "examples": "Examples",
        "feature": "Feature",
        "name": "Scouse",
        "but": "Buh",
        "and": "An",
        "scenario_outline": "Wharrimean is",
        "background": "Dis is what went down",
        "native": "Scouse",
        "when": "Wun|Youse know like when",
        "then": "Dun|Den youse gotta",
        "given": "Givun|Youse know when youse got",
        "scenario": "The thing of it is"
    },
    "cs": {
        "examples": "Příklady",
        "feature": "Požadavek",
        "name": "Czech",
        "but": "Ale",
        "and": "A|A také",
        "scenario_outline": "Náčrt Scénáře|Osnova scénáře",
        "background": "Pozadí|Kontext",
        "native": "Česky",
        "when": "Když",
        "then": "Pak",
        "given": "Pokud",
        "scenario": "Scénář"
    },
    "bg": {
        "examples": "Примери",
        "feature": "Функционалност",
        "name": "Bulgarian",
        "but": "Но",
        "and": "И",
        "scenario_outline": "Рамка на сценарий",
        "background": "Предистория",
        "native": "български",
        "when": "Когато",
        "then": "То",
        "given": "Дадено",
        "scenario": "Сценарий"
    },
    "pl": {
        "examples": "Przykłady",
        "feature": "Właściwość",
        "name": "Polish",
        "but": "Ale",
        "and": "Oraz",
        "scenario_outline": "Szablon scenariusza",
        "background": "Założenia",
        "native": "polski",
        "when": "Jeżeli",
        "then": "Wtedy",
        "given": "Zakładając",
        "scenario": "Scenariusz"
    },
    "en-au": {
        "examples": "Cobber",
        "feature": "Crikey",
        "name": "Australian",
        "but": "Cept",
        "and": "N",
        "scenario_outline": "Blokes",
        "background": "Background",
        "native": "Australian",
        "when": "When",
        "then": "Ya gotta",
        "given": "Ya know how",
        "scenario": "Mate"
    },
    "ar": {
        "examples": "امثلة",
        "feature": "خاصية",
        "name": "Arabic",
        "but": "لكن",
        "and": "و",
        "scenario_outline": "سيناريو مخطط",
        "background": "الخلفية",
        "native": "العربية",
        "when": "متى|عندما",
        "then": "اذاً|ثم",
        "given": "بفرض",
        "scenario": "سيناريو"
    },
    "sr-Latn": {
        "examples": "Primeri|Scenariji",
        "feature": "Funkcionalnost|Mogućnost|Mogucnost|Osobina",
        "name": "Serbian (Latin)",
        "but": "Ali",
        "and": "I",
        "scenario_outline": "Struktura scenarija|Skica|Koncept",
        "background": "Kontekst|Osnova|Pozadina",
        "native": "Srpski (Latinica)",
        "when": "Kada|Kad",
        "then": "Onda",
        "given": "Zadato|Zadate|Zatati",
        "scenario": "Scenario|Primer"
    },
    "ro": {
        "examples": "Exemplele",
        "feature": "Functionalitate",
        "name": "Romanian",
        "but": "Dar",
        "and": "Si",
        "scenario_outline": "Scenariul de sablon",
        "background": "Conditii",
        "native": "română",
        "when": "Cand",
        "then": "Atunci",
        "given": "Daca",
        "scenario": "Scenariu"
    },
    "he": {
        "examples": "דוגמאות",
        "feature": "תכונה",
        "name": "Hebrew",
        "but": "אבל",
        "and": "וגם",
        "scenario_outline": "תבנית תרחיש",
        "background": "רקע",
        "native": "עברית",
        "when": "כאשר",
        "then": "אז|אזי",
        "given": "בהינתן",
        "scenario": "תרחיש"
    },
    "en-lol": {
        "examples": "EXAMPLZ",
        "feature": "OH HAI",
        "name": "LOLCAT",
        "but": "BUT",
        "and": "AN",
        "scenario_outline": "MISHUN SRSLY",
        "background": "B4",
        "native": "LOLCAT",
        "when": "WEN",
        "then": "DEN",
        "given": "I CAN HAZ",
        "scenario": "MISHUN"
    },
    "da": {
        "examples": "Eksempler",
        "feature": "Egenskab",
        "name": "Danish",
        "but": "Men",
        "and": "Og",
        "scenario_outline": "Abstrakt Scenario",
        "background": "Baggrund",
        "native": "dansk",
        "when": "Når",
        "then": "Så",
        "given": "Givet",
        "scenario": "Scenarie"
    },
    "vi": {
        "examples": "Dữ liệu",
        "feature": "Tính năng",
        "name": "Vietnamese",
        "but": "Nhưng",
        "and": "Và",
        "scenario_outline": "Khung tình huống|Khung kịch bản",
        "background": "Bối cảnh",
        "native": "Tiếng Việt",
        "when": "Khi",
        "then": "Thì",
        "given": "Biết|Cho",
        "scenario": "Tình huống|Kịch bản"
    },
    "tr": {
        "examples": "Örnekler",
        "feature": "Özellik",
        "name": "Turkish",
        "but": "Fakat|Ama",
        "and": "Ve",
        "scenario_outline": "Senaryo taslağı",
        "background": "Geçmiş",
        "native": "Türkçe",
        "when": "Eğer ki",
        "then": "O zaman",
        "given": "Diyelim ki",
        "scenario": "Senaryo"
    },
    "ro-RO": {
        "examples": "Exemplele",
        "feature": "Funcționalitate",
        "name": "Romanian (diacritical)",
        "but": "Dar",
        "and": "Și",
        "scenario_outline": "Scenariul de şablon",
        "background": "Condiţii",
        "native": "română (diacritical)",
        "when": "Când",
        "then": "Atunci",
        "given": "Dacă",
        "scenario": "Scenariu"
    },
    "nl": {
        "examples": "Voorbeelden",
        "feature": "Functionaliteit",
        "name": "Dutch",
        "but": "Maar",
        "and": "En",
        "scenario_outline": "Abstract Scenario",
        "background": "Achtergrond",
        "native": "Nederlands",
        "when": "Als",
        "then": "Dan",
        "given": "Gegeven|Stel",
        "scenario": "Scenario"
    },
    "lt": {
        "examples": "Pavyzdžiai|Scenarijai|Variantai",
        "feature": "Savybė",
        "name": "Lithuanian",
        "but": "Bet",
        "and": "Ir",
        "scenario_outline": "Scenarijaus šablonas",
        "background": "Kontekstas",
        "native": "lietuvių kalba",
        "when": "Kai",
        "then": "Tada",
        "given": "Duota",
        "scenario": "Scenarijus"
    },
    "ca": {
        "examples": "Exemples",
        "feature": "Característica|Funcionalitat",
        "name": "Catalan",
        "but": "Però",
        "and": "I",
        "scenario_outline": "Esquema de l'escenari",
        "background": "Rerefons|Antecedents",
        "native": "català",
        "when": "Quan",
        "then": "Aleshores|Cal",
        "given": "Donat|Donada|Atès|Atesa",
        "scenario": "Escenari"
    },
    "lu": {
        "examples": "Beispiller",
        "feature": "Funktionalitéit",
        "name": "Luxemburgish",
        "but": "awer|mä",
        "and": "an|a",
        "scenario_outline": "Plang vum Szenario",
        "background": "Hannergrond",
        "native": "Lëtzebuergesch",
        "when": "wann",
        "then": "dann",
        "given": "ugeholl",
        "scenario": "Szenario"
    },
    "en-pirate": {
        "examples": "Dead men tell no tales",
        "feature": "Ahoy matey!",
        "name": "Pirate",
        "but": "Avast!",
        "and": "Aye",
        "scenario_outline": "Shiver me timbers",
        "background": "Yo-ho-ho",
        "native": "Pirate",
        "when": "Blimey!",
        "then": "Let go and haul",
        "given": "Gangway!",
        "scenario": "Heave to"
    },
    "cy-GB": {
        "examples": "Enghreifftiau",
        "feature": "Arwedd",
        "name": "Welsh",
        "but": "Ond",
        "and": "A",
        "scenario_outline": "Scenario Amlinellol",
        "background": "Cefndir",
        "native": "Cymraeg",
        "when": "Pryd",
        "then": "Yna",
        "given": "Anrhegedig a",
        "scenario": "Scenario"
    },
    "en": {
        "examples": "Examples|Scenarios",
        "feature": "Feature",
        "name": "English",
        "but": "But",
        "and": "And",
        "scenario_outline": "Scenario Outline",
        "background": "Background",
        "native": "English",
        "when": "When",
        "then": "Then",
        "given": "Given",
        "scenario": "Scenario"
    },
    "sr-Cyrl": {
        "examples": "Примери|Сценарији",
        "feature": "Функционалност|Могућност|Особина",
        "name": "Serbian",
        "but": "Али",
        "and": "И",
        "scenario_outline": "Структура сценарија|Скица|Концепт",
        "background": "Контекст|Основа|Позадина",
        "native": "Српски",
        "when": "Када|Кад",
        "then": "Онда",
        "given": "Задато|Задате|Задати",
        "scenario": "Сценарио|Пример"
    },
    "lv": {
        "examples": "Piemēri|Paraugs",
        "feature": "Funkcionalitāte|Fīča",
        "name": "Latvian",
        "but": "Bet",
        "and": "Un",
        "scenario_outline": "Scenārijs pēc parauga",
        "background": "Konteksts|Situācija",
        "native": "latviešu",
        "when": "Ja",
        "then": "Tad",
        "given": "Kad",
        "scenario": "Scenārijs"
    },
    "hr": {
        "examples": "Primjeri|Scenariji",
        "feature": "Osobina|Mogućnost|Mogucnost",
        "name": "Croatian",
        "but": "Ali",
        "and": "I",
        "scenario_outline": "Skica|Koncept",
        "background": "Pozadina",
        "native": "hrvatski",
        "when": "Kada|Kad",
        "then": "Onda",
        "given": "Zadan|Zadani|Zadano",
        "scenario": "Scenarij"
    },
    "eo": {
        "examples": "Ekzemploj",
        "feature": "Trajto",
        "name": "Esperanto",
        "but": "Sed",
        "and": "Kaj",
        "scenario_outline": "Konturo de la scenaro",
        "background": "Fono",
        "native": "Esperanto",
        "when": "Se",
        "then": "Do",
        "given": "Donitaĵo",
        "scenario": "Scenaro"
    }
};
