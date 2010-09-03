/* App Start */

// json-rpc stub, replace this
var stubAST = {
  '1': {
    name: 'Addition',
    description: "In order to avoid silly mistakes\n As a math idiot\n I want to be told the sum of two numbers",
    scenarios: [
      {
        outline: true,
        name: 'Add two numbers',
        breakdown: [
          { '1': ['Given', 'I have entered 50 into the calculator'] },
          { '2': ['And',   'I have entered 70 into the calculator'] },
          { '3': ['When',  'I press add'] },
          { '4': ['Then',  'the result should be 120 on the screen'] }
        ],
        examples: {
          // Remark: Only valid if outline === true
          "header0" : ['value1', 'value2', 'value3'],
          "header1" : ['value1', 'value2', 'value3'],
          "header2" : ['value1', 'value2', 'value3']
        }
      }
    ]
  }
};

// TODO: this shouldn't be in the global namespace
// TODO: key bindings could done be via event delegation of keypress on the document, possible candidate for refactor 
var keyBindings = {};

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
                var pair = ["foo"];
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
                          var breakdown = ["<ul class='sortable-ui steps'>"];
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
                  
                  ["h3", { "class": "feature ms" + feature.milestone },
                      ["input", { "type": "text", "value": feature.name }],
                      ["div", { "class": "remove delete-feature ui-state-default ui-corner-all", "title": "Remove feature"  }, 
                        ["span", "&nbsp"]
                      ]
                  ],
                  
                  ["div", { "class": "feature ms" + feature.milestone },
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
              
                jQuery.extend(jQuery.expr[':'], {
                  focus: "a == document.activeElement"
                });
                // Remark: 
                DAL = this.DAL;
                DATA = this.DATA;
              
                // jQuery event pooling can be fun for UI events!!!
                // http://www.michaelhamrah.com/blog/2008/12/event-pooling-with-jquery-using-bind-and-trigger-managing-complex-javascript/


                $(document).bind('ws.submitAST', function(e, data){
                  
                  $.ajax({
                    url: '/export', /* TODO: Need real URL to submit to */
                    type: "POST",
                    data: JSON.stringify(stubAST),
                    success: function(data) {
                      //console.log(data);
                      //$('#export-data code').html(data);
                    }
                  });
                })

                $(document).bind('step.activate', function(e, step){
                  console.log('step.activate');
                  $('.steps li').removeClass('active').removeClass('hover');
                  $(step).addClass('active');
                  $('.steps input').removeClass("inlineEditHover");
                  //console.log($(step).find('input'));
                  $(step).find('input').focus().addClass("inlineEditHover").caret(0,0 );
                  
                  $(document).unbind('keyBindings.canCycle');
                  $(document).bind('keyBindings.canCycle', keyBindings.canCycle);
                });
                
                $(document).bind('step.hover', function(e, step){
                  $('.steps li').removeClass('hover');
                  if(!$(step).hasClass('active')){
                    $(step).addClass('hover');
                  }
                });

                $(document).bind('step.delete', function(e, step){
                  $(step).closest('li').slideUp(300, function(){
                    $(step).remove()
                  });
                });
                
                $(document).bind('scenario.delete', function(e, scenario){
                  $(scenario).slideUp(300, function(){
                    $(this).remove()
                  });
                });

                $(document).bind('scenario.activate', function(e, scenario){
                  $('.scenario').removeClass('active').removeClass('hover');
                  $(scenario).addClass('active');
                  $(scenario).find('input').focus().addClass("inlineEditHover").caret(0,0 );
                });

                $(document).bind('scenario.hover', function(e, scenario){
                  $('.scenario').removeClass('hover');
                  $(scenario).addClass('hover');
                });

                $(document).bind('feature.add', function(e, feature){
                  var out = NJ.nup.renderFeature(1, feature);
                  $('#featureslist').append($.jup.html(out));
                  // close all other Featuresaccordions
                  $('#featureslist').accordion( "activate", false);
                  // rebind accordion
                  $(document).trigger('features.applyAccordions');

                });

                $(document).bind('feature.activate', function(e, feature){
                  $('.feature').removeClass('active').removeClass('hover');
                  $(feature).addClass('active');
                  var theInput = $('.feature:first').find('input:first');
                  theInput.addClass('inlineEditHover');
                  $("#featureslist").accordion( "activate" , 0 );
                });


                // Remark: this is a basic fix to apply all .accordion() events across the entire page
                //         this event is a good candidate for refactoring
                
                $(document).bind('features.applyAccordions', function(e){
                  
                  
                  $("#featureslist").accordion('destroy').accordion({ 
                    collapsible: true, 
                    autoHeight: false, 
                    active: false
                  }).find("input, h3").click(function(e){
                      
                      
                      if($(e.originalTarget).parent().hasClass('delete-scenario')){
                        //e.stopPropagation();
                        //e.preventDefault();
                        
                        $(document).trigger('scenario.delete', $(e.originalTarget).closest('.scenario'));
                        return false;
                      }

                      //e.stopPropagation();
                      //e.preventDefault();
                  });
                  
                  $(".scenario").accordion({ 
                    collapsible: true, 
                    autoHeight: false, 
                    active: false

                  });
                  //$(".scenario:last").accordion( "activate" , $(".scenario h3:last"));
                  
                });
                
                $("#projectTitle").text(DAL.get.projectTitle());
              
                $("#instructions .remove").click(function() {
                  $(this).parent().fadeOut();
                });
                
                // splash page dialog
                var splash = $("#splash").dialog({
                  resizable: false,
                  width: 655,
                  height: 400,
                  modal: true,
                  speed: 1500,
                  dialogClass: "shadow splash",
                  close: function(event, ui){
                    $('#container').fadeIn(50, function(e){
                      $('.feature:first').find('input:first').focus();
                      $('.feature:first').find('input:first').caret(0,0);
                    });
                  },             
                  buttons: {
                    "ok": function() {
                      var self = this;
                      $('span#progressBar').remove();
                      $(self).dialog("close");
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
                      
                      // put ajax post here
                      $(document).trigger('ws.submitAST');
                      $(this).dialog("close");
                      
                    }
                  }
                });
                
                
                $('.ui-dialog-buttonpane').prepend('<span id="progressBar"/>'); // slight hack to add progressBar to modal
                $('.ui-button').attr('disabled', 'disabled');
                $('.ui-button').css('opacity', 0.5);
                $('#progressBar').slider({
                  range: "min"
                }).show();
                
                // Remark: start up the progress bar, perhaps move this code
                function progressSlider() {
                  if($('#progressBar').slider('value') < 100){
                    $('#progressBar').slider('value', $('#progressBar').slider('value') + 1);
                    setTimeout(progressSlider, 10);
                  }
                  else{
                    $('#progressBar').unbind("click mousedown");
                    $('.ui-button').attr('disabled', '');
                    $('.ui-button').css('opacity', 1);
                  }
                }
                
                setTimeout(progressSlider, 200);
                
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
                  $("h3.feature." + $(this).attr("id"))[$(this).attr("checked") ? "fadeIn" : "fadeOut"]();
                  if($("h3.feature." + $(this).attr("id")).hasClass('ui-state-active')){  
                    $("h3.feature." + $(this).attr("id")).click();
                    $("div.feature." + $(this).attr("id"))[$(this).attr("checked") ? "fadeIn" : "fadeOut"]();
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
                
                $(document).trigger('features.applyAccordions');
                
                $("#featureslist input, #projectTitle").live("mouseover", function() {
                  $(this).addClass("inlineEditHover");
                }).live("mouseout", function() {
                  $(this).removeClass("inlineEditHover");
                })
                
                $('.sortable-ui').sortable({ 
                  containment: "parent", 
                  axis: "y",
                  stop: function(e){
                    var step =  $(e.originalTarget).closest('.step').parent();
                    if(!$(step).hasClass('active')){
                      $(document).trigger('step.activate', step);
                    }
                  }
                });
                
                $('.steps li').live('mousedown', function(e){
                  $(document).trigger('step.activate', this);
                });

                $('.scenario').live('mousedown', function(e){
                  $(document).trigger('scenario.activate', this);
                });

                // Remark: step.hover should take in two callbacks as arguments
                $('.steps li').live('hover', 
                  function(e){
                    $(document).trigger('step.hover', this)
                  },
                  function(e){
                    $(this).removeClass('hover');
                  }
                );

                $('.scenario').live('hover', 
                  function(e){
                    $(document).trigger('scenario.hover', this);
                  },
                  function(e){
                    $(this).removeClass('hover');                    
                  }
                );
                                
                // for adding additional steps in a scenario
                $('.add-step').live('click', function(){
                  $(this).siblings('ul').append($.jup.html(NJ.nup.renderStep()));
                  $('.sortable-ui').sortable('refresh');
                });
                
                // for removing steps in a scenario
                $(".delete-step").live("click", function(){
                  $(document).trigger('step.delete', this);
                });
                
                
                $(".delete-feature").live("click", function(e){
                  console.log('delete feature');
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
                  out = $.jup.html(out)
                  $(this).before(out);
                  
                  $(".scenario").accordion({ 
                    collapsible: true, 
                    autoHeight: false, 
                    active: false

                  });
                  $(this).prev().find('.sortable-ui').sortable({ 
                    containment: "parent", 
                    axis: "y",
                    stop: function(e){
                      var step =  $(e.originalTarget).closest('.step').parent();
                      if(!$(step).hasClass('active')){
                        $(document).trigger('step.activate', step);
                      }
                    }
                  });
                  /*
                  .find("input, h3").click(function(ev){
                      ev.stopImmediatePropagation();
                      ev.preventDefault();
                      stop = false;
                  });
                  */
                  //$(document).trigger('features.applyAccordions');
                  //$(".scenario:last").accordion( "activate" , $(".scenario h3:last"));
                  
                });
                
                $('.add-feature').click(function(e){
                  $(document).trigger('feature.add', NJ.nup.DAL.get.features()[1]);
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
                
               function onKeyDown(e){
                 
                  console.log(e.which);
                  var events = $(document).data('events');
                  for(var eventName in events){
                    for(var i = 0; i < events[eventName].length; i++){
                      if(events[eventName][i].type == 'keyBindings'){
                        $(document).trigger(events[eventName][i].type + '.' + events[eventName][i].namespace, e);
                      }
                    }
                  }
               }
                
               $(document).bind('keydown', onKeyDown);
               
               keyBindings.canDeleteSteps = function(e, originalEvent){
                 if(originalEvent.which == 8){
                   $(document).trigger('step.delete', $('.active:last'));
                   // Remark: we should be doing this with classes instead
                   if(!$(originalEvent.originalTarget).get(0).tagName == 'INPUT'){
                     //console.log(e, 'del key', $('.active:last'));
                   }
                   return false; // required to prevent browser from navigating to previous page
                 }
               };
               
               keyBindings.canCycle = function(e, originalEvent){
                 
                 
                 // determine where in the dom the originalEvent emitted from
                 
                 console.log('canCycle', originalEvent);
                 if(originalEvent.which == 38) { // up
                   var prevStep = $(originalEvent.originalTarget).closest('.step').parent().prev();
                   if(prevStep.length!=0){
                     $(document).trigger('step.activate', prevStep);
                   }
                 }
                 if(originalEvent.which == 40) { // down
                   var nextStep = $(originalEvent.originalTarget).closest('.step').parent().next();
                   if(nextStep.length!=0){
                     $(document).trigger('step.activate', nextStep);
                   }
                 }

               }



               $(document).bind('keyBindings.canDeleteSteps', keyBindings.canDeleteSteps);

               $('.ui-accordion').bind('accordionchange', function(event, ui) {
                 
                 console.log($(ui.newHeader).parent());
                 
                 $(document).trigger('scenario.activate', $(ui.newHeader).parent());
                 
                 /*
                 ui.newHeader // jQuery object, activated header
                 ui.oldHeader // jQuery object, previous header
                 ui.newContent // jQuery object, activated content
                 ui.oldContent // jQuery object, previous content
                 */
               });

               
               $('input').focus(function(){
                 
                 // TODO: determine if input is inside of Step, this will check whole document
                 var feature =  $(this).closest('.feature').parent();
                 if(!$(feature).hasClass('active')){
                   $(document).trigger('feature.activate', feature);
                 }

                 var step =  $(this).closest('.step').parent();
                 //console.log($(step));
                 //console.log($(step).hasClass('active'));
                 if(!$(step).hasClass('active')){
                   //$(document).trigger('step.activate', step);
                 }
                 
                 /*
                 $('input').removeClass('inlineEditHover');
                 $(this).addClass('inlineEditHover');
                 $(document).unbind('keyBindings.canDeleteSteps');
                 */
               });
                
               $('input').bind('blur',function(){
                 $(document).bind('keyBindings.canDeleteSteps', keyBindings.canDeleteSteps);
               });
                
                
             if(!(_.isEmpty(DAL.get.milestones()))){
               $("h3.feature, div.feature")["hide"]();
               $("label[for='ms1']").click();
               $("#ms1").attr("checked", true);
               $("h3.feature.ms1")["fadeIn"]();
              }
                
                
            },

            determineContext: function() {

                
                
            },
            
            DATA: { // dummy-data, this would be replaced by loaded data.

                language: "en",
                project: "Build a node.js application",
                milestones: {
                    "1": "Build an HTTP server", 
                    "2": "Build a client facing API"
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
                        name: "Respond to incoming requests",
                        description: "In order to respond to incoming requests, as an http.Server instance, I need to process requests",
                        timeunit: "hour",
                        costPerTimeUnit: 80,
                        scenarios: [
                            {
                                id: 0,                                
                                outline: false,                                
                                time: 20,
                                name: "Process well formed request",
                                description: "a regular looking http request",
                                breakdown: [
                                    {"1": ["given", "the http.Server instances recieves a callback"]},
                                    {"2": ["and", "it has a recieved a response and an request as the arguments"]},                                    
                                    {"3": ["then", "the incoming request should be responded to"]}
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

