
// TODO: this shouldn't be in the global namespace
// TODO: key bindings could done be via event delegation of keypress on the document, possible candidate for refactor 

$(function() {

    (function() {

        var options = $.querystring.toJSON();
        var context, DAL, DATA, keyBindings;
        var doc = $(document);
        var counter = 0;
        
        function uniqueID() {
          return ++counter;
        }

        // custom .trigger logger
        var _trigger = $.fn.trigger;
        $.fn.trigger = function(name,args,p){
          // perform some logic to determine what to debug
          if(typeof name != 'object'){
            //console.log(name, args, _trigger);
          }
          return _trigger.apply(this,arguments);
        };
      
        jQuery.extend(jQuery.expr[':'], {
          focus: "a == document.activeElement"
        });

        return {

               Main: function() {

                 APP.exec.call(this, {

                   ns: "NJ.nup", /* namespace */

                   plan: [ /* execution plan */
                    
                    "splash"
                    ,"pageLoad"
                    ,"determineContext"
                   ]
              });
            },
            
            keyBindings: {
              
              canDeleteSteps: function(e, originalEvent){
                if(originalEvent.which == 8){
                  doc.trigger('step.delete', $('.active:last'));
                  // Remark: we should be doing this with classes instead
                  if(!$(originalEvent.originalTarget).get(0).tagName == 'INPUT'){
                    //console.log(e, 'del key', $('.active:last'));
                  }
                  return false; // required to prevent browser from navigating to previous page
                }
              },
              
              canCycle: function(e, originalEvent){
                
                // determine where in the dom the originalEvent emitted from
                
                //console.log('canCycle', originalEvent);
                if(originalEvent.which == 38) { // up
                  var prevStep = $(originalEvent.originalTarget).closest('.step').parent().prev();
                  if(prevStep.length!=0){
                    doc.trigger('step.activate', prevStep);
                  }
                }
                if(originalEvent.which == 40) { // down
                  var nextStep = $(originalEvent.originalTarget).closest('.step').parent().next();
                  if(nextStep.length!=0){
                    doc.trigger('step.activate', nextStep);
                  }
                }

              },
              
              keyDown: function(e) {
                //console.log(e.which);
                var events = doc.data('events');
                for(var eventName in events){
                  for(var i = 0; i < events[eventName].length; i++){
                    if(events[eventName][i].type == 'keyBindings'){
                      doc.trigger(events[eventName][i].type + '.' + events[eventName][i].namespace, e);
                    }
                  }
                }                
              }

            },
            
            renderStep: function(pair){
              
              if(typeof pair == 'undefined'){
                var pair = ["foo"];
              }
              
              return ["li", { "class": "ui-corner-all ui-state-default" },
                  ["table", { "class": "step", "id": "element-" + uniqueID() },
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
            
            splash: function() {
              
              $("#splash").dialog({
                 resizable: false,
                 width: 655,
                 height: 400,
                 modal: true,
                 speed: 1500,
                 dialogClass: "shadow splash",
                 open: function() {
                   
                   setTimeout(function progress() {
                     if($('#progressBar').slider('value') < 100){
                       $('#progressBar').slider('value', $('#progressBar').slider('value') + 1);
                       setTimeout(progress, 10);
                     }
                     else{
                       $('#progressBar').unbind("click mousedown");
                       $('.ui-button').attr('disabled', '');
                       $('.ui-button').css('opacity', 1);
                     }
                   }, 200);
                 },
                 close: function(event, ui){
                   $('#container').fadeIn(50, function(e){
                     $('.feature:first').find('input:first').focus();
                     $('.feature:first').find('input:first').caret(0,0);
                   });
                 }             
              });
              
            },
            
            pageLoad: function() {
              
                // Remark: 
                DAL = this.DAL;
                DATA = this.DATA;
                keyBindings = this.keyBindings;

                // jQuery event pooling can be fun for UI events!!!
                // http://www.michaelhamrah.com/blog/2008/12/event-pooling-with-jquery-using-bind-and-trigger-managing-complex-javascript/

                doc.bind('keydown', keyBindings.keyDown);

                doc.bind('keyBindings.canDeleteSteps', keyBindings.canDeleteSteps);

                doc.bind('ws.submitAST', function(e, callback){
                    $.ajax({
                      url: '/export', /* TODO: Need real URL to submit to */
                      type: "POST",
                      dataType: "JSON",
                      data: JSON.stringify(NJ.nup.DATA.features),
                      success: function(data) {
                        callback(JSON.parse(data));
                      }
                    });
                })

                /*
                doc.bind('textPad.activate', function(e){
                  $('.textPad textarea').val('asd');
                  $('.textPad').show();
                });
                */

                doc.bind('step.activate', function(e, step){
                  //console.log('step.activate');
                  $('.steps li').removeClass('active').removeClass('hover');
                  $(step).addClass('active');
                  $('.steps input').removeClass("inlineEditHover");
                  //console.log($(step).find('input'));
                  $(step).find('input').focus().addClass("inlineEditHover").caret(0,0 );
                  
                  doc.unbind('keyBindings.canCycle');
                  doc.bind('keyBindings.canCycle', keyBindings.canCycle);
                });
                
                doc.bind('step.hover', function(e, step){
                  $('.steps li').removeClass('hover');
                  if(!$(step).hasClass('active')){
                    $(step).addClass('hover');
                  }
                });

                doc.bind('step.delete', function(e, step){
                  $(step).closest('li').slideUp(300, function(){
                    $(step).remove();
                  });
                });
                
                doc.bind('scenario.delete', function(e, scenario){
                  $(scenario).slideUp(300, function(){
                    $(this).remove();
                  });
                });

                doc.bind('scenario.activate', function(e, scenario){
                  $('.scenario').removeClass('active').removeClass('hover');
                  $(scenario).addClass('active');
                  $(scenario).find('input').focus().addClass("inlineEditHover").caret(0,0 );
                });

                doc.bind('scenario.hover', function(e, scenario){
                  $('.scenario').removeClass('hover');
                  $(scenario).addClass('hover');
                });

                doc.bind('feature.add', function(e, feature){
                  var out = NJ.nup.renderFeature(1, feature);
                  $('#featureslist').append($.jup.html(out));
                  // close all other Featuresaccordions
                  $('#featureslist').accordion( "activate", false);
                  // rebind accordion
                  doc.trigger('features.applyAccordions');

                });

                doc.bind('feature.activate', function(e, feature){
                  $('.feature').removeClass('active').removeClass('hover');
                  $(feature).addClass('active');
                  var theInput = $('.feature:first').find('input:first');
                  theInput.addClass('inlineEditHover');
                  $("#featureslist").accordion( "activate" , 0 );
                });


                // Remark: this is a basic fix to apply all .accordion() events across the entire page
                //         this event is a good candidate for refactoring
                
                doc.bind('features.applyAccordions', function(e){
                  
                  
                  $("#featureslist").accordion('destroy').accordion({ 
                    collapsible: true, 
                    autoHeight: false, 
                    active: false
                  }).find("input, h3").click(function(e){
                      
                      
                      if($(e.originalTarget).parent().hasClass('delete-scenario')){
                        //e.stopPropagation();
                        //e.preventDefault();
                        
                        doc.trigger('scenario.delete', $(e.originalTarget).closest('.scenario'));
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
                
                
               $("#export-stubs").dialog({
                  resizable: false,
                  autoOpen: false,
                  height: 500,
                  width: 900,
                  modal: true,                  
                  dialogClass: "shadow",                  
                  buttons: {
                    "close": function() {
                      $(this).dialog("close");
                    }
                  }
                });
                
                $('#okay').button().click(function(){
                  $('#splash').dialog( "close" );
                });
                $('.ui-button').attr('disabled', 'disabled');
                $('.ui-button').css('opacity', 0.5);
                $('#progressBar').slider({
                  range: "min"
                }).show();
                

                
                $("footer").click(function() {
                  // put ajax post here
                  doc.trigger('ws.submitAST', function(rsp){
                    //console.log(rsp[0].text);
                    $('#export-stubs code').html(rsp[0].text);
                    hijs(); 
                    $('#export-stubs').dialog("open");
           
                  });
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
                
                doc.trigger('features.applyAccordions');
                
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
                      doc.trigger('step.activate', step);
                    }
                  }
                });
                
                $('.steps li').live('mousedown', function(e){
                  doc.trigger('step.activate', this);
                });

                $('.scenario').live('mousedown', function(e){
                  doc.trigger('scenario.activate', this);
                });

                // Remark: step.hover should take in two callbacks as arguments
                $('.steps li').live('hover', 
                  function(e){
                    doc.trigger('step.hover', this)
                  },
                  function(e){
                    $(this).removeClass('hover');
                  }
                );

                $('.scenario').live('hover', 
                  function(e){
                    doc.trigger('scenario.hover', this);
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
                  doc.trigger('step.delete', this);
                });
                
                
                $(".delete-feature").live("click", function(e){
                  //console.log('delete feature');
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
                        doc.trigger('step.activate', step);
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
                  //doc.trigger('features.applyAccordions');
                  //$(".scenario:last").accordion( "activate" , $(".scenario h3:last"));
                  
                });
                
                $('.add-feature').click(function(e){
                  doc.trigger('feature.add', NJ.nup.DAL.get.features()[1]);
                });

                $('.add-milestone').live('click', function(e){
                  
                  var html = [];
                  html.push(NJ.nup.renderMilestone($("#toolbar .btn").length + 1, 'milestone x'));
                  $("#toolbar ul").append(html.join("")).disableSelection().sortable();
                  $("#toolbar .btn:last").button();
                  
                });
                
                $('.toggle-view').click(function(e){
                  if($(this).html() == 'Use Textpad Instead &lt; '){
                    $('.textPad textarea').val(NJ.nup.featureDistiller());
                    $('#featureslist').hide();
                    $('.textPad').show();
                    $(this).html('Use UI Instead &gt; ');
                  }
                  else{
                    $(this).html('Use Textpad Instead &lt; ');
                    $('.textPad').hide();
                    $('#featureslist').show();
                  }
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
                


               $('.ui-accordion').bind('accordionchange', function(event, ui) {
                 
                 //console.log($(ui.newHeader).parent());
                 
                 doc.trigger('scenario.activate', $(ui.newHeader).parent());
                 
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
                   doc.trigger('feature.activate', feature);
                 }

                 var step =  $(this).closest('.step').parent();
                 //console.log($(step));
                 //console.log($(step).hasClass('active'));
                 if(!$(step).hasClass('active')){
                   //doc.trigger('step.activate', step);
                 }
                 
                 /*
                 $('input').removeClass('inlineEditHover');
                 $(this).addClass('inlineEditHover');
                 doc.unbind('keyBindings.canDeleteSteps');
                 */
               });
                
               $('input').bind('blur',function(){
                 doc.bind('keyBindings.canDeleteSteps', keyBindings.canDeleteSteps);
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

            
            
            DATA: { // dummy-data, this would be replaced by loaded data. @function() {

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
                    },
                    breakdown: function(config) { // breakdowns contains "Steps"
                      
                      // TODO: implement
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
                      
                    }
                }
            }
        
        }
        
    })().Main(); 
});
