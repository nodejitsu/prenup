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
            
            renderStep: function(pair){
              
              if(typeof pair == 'undefined'){
                var pair = [];
              }
              
              return ["li", { "class": "ui-corner-all ui-state-default" },
                  ["table", { "class": "step" },
                    ["tr", [
                      ["td", { "class": "grip-col" }, ["span", { "class": "ui-icon ui-icon-arrowthick-2-n-s grip" }]],
                      ["td", { "class": "operator-col" }, [NJ.nup.renderWordSelector(DAL.get.operators(), pair[0])]],
                      ["td", { "class": "content-col" }, ["input", { "type": "text", "value": pair[1] }]],
                      ["td", { "class": "delete-col" }, ["div", { "class": "remove delete-step ui-state-default ui-corner-all", "title": "Remove scenario" }, 
                        ["span", "&nbsp"]
                      ]]
                    ]]
                  ]
              ];
            },

            renderWordSelector: function(data, value){
              return ["select", [
                  (function() {
                      var options = [];
                      $.each(data, function(i, operator) {
                        
                          options.push($.jup.html(["option", (value.toLowerCase() === operator.toLowerCase() ? { "selected": "true" } : {}), operator]));
                      });
                      return options;                             
                  })()
              ]];
            },
            
            renderScenario: function(key, scenario){
              return ["div", { "class": "scenario" },
                  ["h3", { "class": "breakdown" },
                      ["input", { "type": "text", "value": scenario.name }],
                      ["div", { "class": "remove delete-scenario ui-state-default ui-corner-all", "title": "Remove scenario" }, 
                        ["span", "&nbsp"]
                      ]
                  ],
                  ["div",
                      (function() {
                          var breakdown = ["<ul class='sortable-ui'>"];
                          $.each(scenario.breakdown, function(key, step) {
                              $.each(step, function(key, pair) {
                                  breakdown.push($.jup.html(NJ.nup.renderStep(pair)));
                              });
                          });
                          breakdown.push("</ul>");
                          return breakdown.join("") + $.jup.html(['button',{ "class": "add-step" }, 'Add Step +']) ;
                      })()
                  ]
              ];
            },
            
            renderFeature: function(i, feature){
              return [
                  
                  ["h3", { "class": "milestone-member ms" + feature.milestone },
                      ["input", { "type": "text", "value": feature.name }],
                      ["div", { "class": "remove delete-feature ui-state-default ui-corner-all", "title": "Remove feature"  }, 
                        ["span", "&nbsp"]
                      ]
                  ],
                  
                  ["div", { "class": "milestone-member ms" + feature.milestone },
                      (function() {

                          var scenarios = [];

                          $.each(feature.scenarios, function(key, scenario) {
                              scenarios.push($.jup.html(NJ.nup.renderScenario(key, scenario)));
                          });
                          scenarios.push($.jup.html(['button',{ "class": "add-scenario" }, 'Add Scenario +']));
                          return scenarios.join("");

                      })()
                  ],
                  
              ];
            },
            
            renderMilestone: function(key, milestone){
              
              var html = [];

              html.push($.jup.html(["li",
                  ["input", { "class": "btn", "id": "ms" + key, "type": "checkbox" }], 
                  ["label", { "class": "milestone", "for": "ms" + key }, milestone,
                    ["img", {"src": "img/delete.png", "height": "22", "width": "22" }]   
                  ]
              ]));
              
              return html;
            },
            
            pageLoad: function() {
                DAL = this.DAL;
                DATA = this.DATA;
                
                $("#projectTitle").text(DAL.get.projectTitle());
              
                $("#instructions .remove").click(function() {
                  $(this).parent().fadeOut();
                });
                
                // some dialogs
                
                var splash = $($.jup.html(
                  ["div", { "id": "splash" },
                    "prenup is an open-source node.js project planning tool that allows you to meaningfully engage your clients and convert their domain knowledge into tangible milestones, features, scenarios, and unit tests."]
                  )).dialog({
                  resizable: false,
                  width: 655,
                  height: 400,
                  modal: true,
                  dialogClass: "shadow splash",             
                  buttons: {
                    "ok": function() {
                      var self = this;
                      $(".ui-dialog:visible").fadeOut(function() {
                        $(self).dialog("close");
                      });
                      
                    }
                  }
                });                
                
                var exportAction = $("#export-data").dialog({
                  resizable: false,
                  autoOpen: false,
                  height: 500,
                  width: 900,
                  modal: true,                  
                  dialogClass: "shadow",                  
                  buttons: {
                    "ok": function() {
                      
                      $.ajax({
                        url: '/whatever/someurl', /* TO-DO: Need real URL to submit to */
                        type: "POST",
                        data: JSON.stringify(NJ.nup.DATA),
                        success: function(data) {
                          $('#export-data code').html(data);
                        }
                      });
                      
                      $(this).dialog("close");
                      
                    }
                  }
                });
                
                $("footer").click(function() {
                  exportAction.dialog("open");
                });                
                
                                          
                
                // render milestones
                var html = [];
                
                $.each(DAL.get.milestones(), function(key, milestone) {
                  html.push(NJ.nup.renderMilestone(key, milestone));
                });

                $("#toolbar ul").html(html.join("")).disableSelection().sortable();
                $("#toolbar .btn").button().live('click', function() {
                  $("h3.milestone-member." + $(this).attr("id"))[$(this).attr("checked") ? "fadeIn" : "fadeOut"]();
                  if($("h3.milestone-member." + $(this).attr("id")).hasClass('ui-state-active')){  
                    $("h3.milestone-member." + $(this).attr("id")).click();
                    $("div.milestone-member." + $(this).attr("id"))[$(this).attr("checked") ? "fadeIn" : "fadeOut"]();
                  }                 
                });
                
                $('#toolbar label img').live('click', function() {
                  $(this).parent().parent().remove();
                  return false;
                })

                // load up the features/scenarios/breakdowns/steps/operators etc.

                html = [];

                $.each(DAL.get.features(), function(i, feature) {
                    html.push($.jup.html(NJ.nup.renderFeature(i, feature)));                    
                });

                $("#featureslist").html(html.join(""));

                // once the UI has rendered, we need to apply UI events to elements

                $("#featureslist, .scenario").accordion({ 
                  collapsible: true, 
                  autoHeight: false, 
                  active: false
                
                }).find("input").click(function(ev){
                    ev.stopPropagation();
                });
                
                $("#featureslist input").live("mouseover", function() {
                  $(this).addClass("inlineEditHover");
                }).live("mouseout", function() {
                  $(this).removeClass("inlineEditHover");
                })
                
                $('.sortable-ui').sortable({ containment: "parent", axis: "y" });
                
                // for adding additional steps in a scenario
                $('.add-step').live('click', function(){
                  $(this).siblings('ul').append($.jup.html(NJ.nup.renderStep()));
                });
                
                // for removing steps in a scenario
                $(".delete-step").live("click", function(){
                  $(this).closest('li').slideUp(300, function(){
                    $(this).remove()
                  });
                });
                
                
                $(".delete-feature").live("click", function(e){
                  e.stopPropagation();
                  if($(this).hasClass('ui-state-active')) {
                    $(this).parent().next(".ui-accordion-content").slideUp(300, function() {
                      $(this).remove();
                    });
                  }
                  else{
                    $(this).parent().next(".ui-accordion-content").remove();
                  }
                  
                  $(this).parent().slideUp(300, function(){
                    $(this).remove()
                  });
                  
                });

                // for adding additional Scenarios in a Feature
                $('.add-scenario').live("click", function(e){
                  // should this stop the accordion from toggling? thats what i want it to do!
                  //e.stopPropagation();

                  var out = NJ.nup.renderScenario(2, NJ.nup.DAL.get.scenariosByFeature(1)[0]);
                  $(this).before($.jup.html(out));
                  
                  // rebind accordion
                  $("#featureslist, .scenario").accordion({ 
                    collapsible: true, 
                    autoHeight: false 

                  }).find("input").click(function(ev){
                      ev.stopPropagation();
                  });
                  
                });
                
                $('.add-feature').click(function(e){
                  var out = NJ.nup.renderFeature(1, NJ.nup.DAL.get.features()[1]);

                  $('#featureslist').append($.jup.html(out));
                  
                  // rebind accordion
                  $("#featureslist, .scenario").accordion('destroy').accordion({ 
                    collapsible: true, 
                    autoHeight: false 

                  }).find("input").click(function(ev){
                      ev.stopPropagation();
                  });                  
                });
                

                $('.add-milestone').live('click', function(e){
                  
                  var html = [];
                  html.push(NJ.nup.renderMilestone($("#toolbar .btn").length + 1, 'milestone x'));
                  $("#toolbar ul").append(html.join("")).disableSelection().sortable();
                  $("#toolbar .btn:last").button();
                  
                });

                $(".delete-scenario").live("click", function(e){
                  e.stopPropagation();
                  $(this).parent().next(".ui-accordion-content").slideUp(300, function() {
                    $(this).remove();
                  });                  
                  $(this).parent().slideUp(300, function(){
                    $(this).remove();
                  });
                });
                
                // do some default stuff, this should be done better.

             if(!(_.isEmpty(DAL.get.milestones()))){
               $("h3.milestone-member, div.milestone-member")["hide"]();
               $("label[for='ms1']").click();
               $("#ms1").attr("checked", true);
               $("h3.milestone-member.ms1")["fadeIn"]();
              }
                
                
            },

            determineContext: function() {

                
                
            },
            
            DATA: { // dummy-data, this would be replaced by loaded data.

                language: "en",
                project: "My Math Project",
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
                        name: "Addition",
                        description: "In order to avoid silly mistakes, as a genius, I want to be told the sum of two numbers.",
                        timeunit: "hour",
                        costPerTimeUnit: 80,
                        scenarios: [
                            {
                                id: 0,                                
                                outline: false,                                
                                time: 20,
                                name: "Add two numbers",
                                description: "blah",
                                breakdown: [
                                    {"1": ["given", "I have entered 50 into the calculator"]},
                                    {"2": ["and", "I press add button"]},                                    
                                    {"3": ["and", "I have entered 70 into the calculator"]},
                                    {"4": ["and", "I press the add button again or the sum button"]},                                    
                                    {"5": ["then", "the result should be 120 on the screen"]}
                                ]
                            },
                            {
                                id: 1,                                
                                outline: false,
                                time: 20,
                                name: "Divide By Zero",                                
                                description: "In mathematics, a division is called a division by zero if the divisor is zero.",
                                breakdown: [
                                    {"1": ["given", "indexzero sits at his computer and writes the lexor"]},
                                    {"2": ["given", "marak eats cheese burgers off of his laptop"]},
                                    {"3": ["then", "code will be awesome as usual"]}
                                ]
                            }
                        ]
                    },
                    "2": {
                        milestone: 2,
                        owner: 1,
                        users: [2, 3],
                        name: "Singup as  a Subscriber",
                        description: "In order to use our website\n As an subscriber\n I need to be able to create a subscriber account and pay for a subscription", 
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
                                name: "Successfully Signup as a subscriber",                                
                                description: "blah",
                                breakdown: [
                                    {"1": ["given", "I have no account"]},
                                    {"2": ["when", "I go to subscriber-signup"]},
                                    {"3": ["then", "should see 'Create an Account'"]},
                                    {"4": ["when", "I fill in the form"]},
                                    {"5": ["and", "I press 'Create Account'"]},
                                    {"6": ["then", "a user should exist with username: 'fotoverite'"]},
                                    {"7": ["and",  "I should be on the success page"]}
                                    
                                ]
                            },
                            {
                                id: 3,
                                outline: false,                                
                                time: 20,
                                name: "Successfully purchase subscription with a different billing address",                                
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

                    projectTitle: function() {
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

