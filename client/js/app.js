
// TODO: this shouldn't be in the global namespace
// TODO: key bindings could done be via event delegation of keypress on the document, possible candidate for refactor 

$(function() {

    (function() {

        var options = $.querystring.toJSON();
        var context, DAL, DATA, keyBindings;
        var doc = $(document);

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
        
        function uniqueID() {
          return Math.floor(Math.random()*2e9);
        }

        return {

               Main: function() {

                 APP.exec.call(this, {

                   ns: "NJ.nup", /* namespace */

                   plan: [ /* execution plan */
                    
                    "splash"
                    ,"export"
                    ,"pageLoad"
                    ,"setupMilestones"
                    ,"codeview"
                    ,"features"
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
                if(originalEvent.which == 13) { // enter / return
                  /*var nextStep = $(originalEvent.originalTarget).closest('.step').parent().next();
                  if(nextStep.length!=0){
                    doc.trigger('step.activate', nextStep);
                  }
                  */
                  doc.trigger('step.add', $(originalEvent.originalTarget).closest('.scenario').find('ul'));
                }

              },
              
              keyDown: function(e) {
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
            
            renderStep: function(pair) {

              pair = pair || ["And", "New Step"];

              var html = $($.jup.html(["li", { "class": "step-container round margin-small" },
                  ["table", { "class": "step" },
                    ["tr", [
                      ["td", { "class": "grip-col" }, ["span", { "class": "ui-icon ui-icon-arrowthick-2-n-s grip" }]],
                      ["td", { "class": "operator-col" }, [NJ.nup.renderWordSelector(DAL.get.operators(), pair[0])]],
                      ["td", { "class": "content-col" }, ["input", { "type": "text", "value": pair[1] }]],
                      ["td", { "class": "delete-col" }, ["div", { "class": "delete delete-step round", "title": "Remove scenario" }, "X"]]
                    ]]
                  ]
              ]));

              html.data({ "id": uniqueID(), "type": "step" });

              return html;
            },

            renderWordSelector: function(data, value) {

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
            
            renderScenario: function(key, scenario) {
              
              scenario = scenario || { name: "New Scenario" };
              
              var html = $($.jup.html(["div", { "class": "round scenario-container" },
                  ["div", { "class": "header" },
                      ["input", { "type": "text", "value": scenario.name }],
                      ["div", { "class": "delete delete-scenario round", "title": "Remove scenario" }, "X"]
                  ],
                  ["div", { "class": "scenario" },
                    ["ul", { "class": "sortable-ui steps" }]
                  ]
              ]));
              
              html.append($.jup.html(
                ["div", { "class": "controls" },
                  ['button',{ "class": "add-step", "title": "Add Step" }]
                ]
              ));

              var container = $(".steps", html);

              if(scenario.breakdown) {
                $.each(scenario.breakdown, function(key, step) {
                  $.each(step, function(key, pair) {
                    container.append(NJ.nup.renderStep(pair));
                  });
                });
              }
              else {
                container.append(NJ.nup.renderStep());
              }

              html.data({ "id": uniqueID(), "type": "scenario" });
              
              return html;

            },

            renderFeature: function(key, feature) {

              feature = feature || { name: "New Feature" };

              var html, container;

              html = $($.jup.html(["div", { "class": "round feature-container" },

                  ["div", { "class": "header" },
                      ["input", { "type": "text", "value": feature.name }],
                      ["div", { "class": "delete delete-feature round", "title": "Remove feature" }, "X"]
                  ],

                  ["div", { "class": "feature" }]
              ]));

              html.append($.jup.html(
                ["div", { "class": "controls" },
                  ['button', { "class": "add-scenario", "title": "Add Scenario" }],
                  ['button', { "class": "add-feature", "title": "Add Feature" }]
                ]
              ));

              html.data({ "milestone": feature.milestone, "type": "milestone" });

              container = $(".feature", html);

              if(feature.scenarios) {
                $.each(feature.scenarios, function(key, scenario) {
                  container.append(NJ.nup.renderScenario(key, scenario));
                });                
              }
              else {
                container.append(NJ.nup.renderScenario(0));
              }

              return html;

            },

            renderMilestone: function(key, milestone) {

              var html = [];

              html.push($.jup.html(["li",
                  ["input", { "class": "btn", "id": "ms" + key, "type": "checkbox" }],
                  ["label", { "class": "milestone", "for": "ms" + key }, milestone,
                    ["img", {"src": "img/delete.png", "height": "22", "width": "22" }]
                  ]
              ]));

              return html;
            },

            setupMilestones: function() {
              
              var html = [];
              
              $.each(DAL.get.milestones(), function(key, milestone) {
                html.push(NJ.nup.renderMilestone(key, milestone));
              });

              $("#toolbar ul").html(html.join("")).disableSelection().sortable();
              
              $("#toolbar .btn").button().live('click', function() {
                
                var container = $(".feature-container." + $(this).attr("id"));
                
                container[$(this).attr("checked") ? "fadeIn" : "fadeOut"]();
                
                if((container).find("feature:visible").length > 0) {
                  container.click();
                  container[$(this).attr("checked") ? "fadeIn" : "fadeOut"]();
                }

              });
              
              $('#toolbar label img').live('click', function() {
                $(this).parent().parent().remove();
                return false;
              });
              
              $('.add-milestone').click(function(e){
                
                var html = [];
                html.push(NJ.nup.renderMilestone($("#toolbar .btn").length + 1, 'milestone x'));
                $("#toolbar ul").append(html.join("")).disableSelection().sortable();
                $("#toolbar .btn:last").button();
                
              });
              
              if(!(_.isEmpty(DAL.get.milestones()))){
                $("label[for='ms1']").click();
                $("#ms1").attr("checked", true);
                $("h3.feature.ms1")["fadeIn"]();
              }                                
              
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
                 close: function(event, ui) {
                   $('#container').fadeIn(50, function(e){
                     $('.feature:first').find('input:first').focus();
                     $('.feature:first').find('input:first').caret(0,0);
                   });
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
              
            },
            
            export: function() {

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
              
            },
            
            codeview: function() {
              
              $('.toggle-view').click(function(e){
                if($(this).html() == 'Use Textpad Instead &lt; '){
                  $('.textPad textarea').val(NJ.nup.featureDistiller());
                  $('#features-container').hide();
                  $('.textPad').show();
                  $(this).html('Use UI Instead &gt; ');
                }
                else{
                  $(this).html('Use Textpad Instead &lt; ');
                  $('.textPad').hide();
                  $('#features-container').show();
                }
              });              
              
            },
            
            pageLoad: function() {

              // Remark: 
              DAL = this.DAL;
              DATA = this.DATA;
              keyBindings = this.keyBindings;
              
              // render in the features/scenarios/steps
              
              $.each(DAL.get.features(), function(i, feature) {
                $("#features-container").append(NJ.nup.renderFeature(i, feature));
              });

              // enable toggeling of feature/scenario/step sections

              $(".header").live("click", function(e) {

                if($(e.target).get(0).tagName == 'INPUT'){
                  return false;
                }
                if($(this).siblings("div:visible").length > 0) {
                  $(this).siblings("div").slideUp(200);
                }
                else {
                  $(this).siblings("div").slideDown(200);                  
                }

              });
              
              $("#projectTitle").text(DAL.get.projectTitle());
              
              // textpad feature, toggle between UI and Raw view.
              
              doc.bind('textPad.activate', function(e){
                $('.textPad textarea').val('asd');
                $('.textPad').show();
              });
              
              // set up events for inputs
              
              $("input").focus(function(){
               
                // TODO: determine if input is inside of Step, this will check whole document
                var feature =  $(this).closest('.feature').parent();
                if(!$(feature).hasClass('active')){
                 //doc.trigger('feature.activate', feature);
                }

                var step =  $(this).closest('.step').parent();
                if(!$(step).hasClass('active')){
                 //doc.trigger('step.activate', step);
                }

                /*
                $('input').removeClass('inlineEditHover');
                $(this).addClass('inlineEditHover');
                doc.unbind('keyBindings.canDeleteSteps');
                */
               
              }).blur(function(){
                doc.bind('keyBindings.canDeleteSteps', keyBindings.canDeleteSteps);
              });
              
              // jQuery event pooling can be fun for UI events!!!
              // http://www.michaelhamrah.com/blog/2008/12/event-pooling-with-jquery-using-bind-and-trigger-managing-complex-javascript/              
              
              // key binding...
              
              this.bindKeys();
              
              // click binding...
              
              this.bindFeatures();
              this.bindScenarios();
              this.bindSteps();
              
              
              // webservice bindings
              this.bindWS();
              
              
              $("footer").click(function() {
                // put ajax post here
                doc.trigger('ws.submitAST', function(rsp){
                  //console.log(rsp[0].text);
                  $('#export-stubs code').html(rsp[0].text);
                  hijs(); 
                  $('#export-stubs').dialog("open");
         
                });
              });                      
              
              
              // TO-DO: touch binding...

            },
            
            bindKeys: function() {

              doc.bind('keydown', keyBindings.keyDown);
              
            },
            
            bindFeatures: function() {
              
              $(".feature-container .add-feature").live("click", function() {
                doc.trigger('feature.add', $(this).closest(".features-container"));
              });              
              
              $(".feature-container .delete-feature").live("click", function() {
                doc.trigger("feature.delete", $(this).closest(".feature-container"));
              });
              
              $(".feature-container").live("click", function() {
                doc.trigger("feature.activate", $(this));
              });
              
              doc.bind("feature.add", function(e) {
                $("#features-container").append(NJ.nup.renderFeature(0));
              });
              
              doc.bind("feature.delete", function(e, el) {
                
                $(el).slideUp(200, function() {
                  $(el).remove();
                });
              });

              doc.bind("feature.activate", function(e, el){
                $(".feature-container").removeClass("active").removeClass("hover");
                $(el).addClass("active");
              });

            },
            
            bindScenarios: function() {
              
              $(".scenario-container .add-scenario").live("click", function(e) {
                doc.trigger("scenario.add", $(this).closest(".feature-container"));
              });              
              
              $(".scenario-container .delete-scenario").live("click", function(e) {
                doc.trigger("scenario.delete", $(this).closest(".scenario-container"));
              });
              
              doc.bind("scenario.add", function(e, el) {
                
                /* 
                
                var out = NJ.nup.renderScenario(2, NJ.nup.DAL.get.scenariosByFeature(1)[0]);
                out = $.jup.html(out)
                $(this).before(out);

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
                
                */                
                
              });
              
              doc.bind("scenario.delete", function(e, el) {
                e.preventDefault();
                $(el).slideUp(200, function(){
                  $(el).remove();
                });
              });
              
              doc.bind("scenario.activate", function(e, scenario){
                $(".scenario").removeClass("active").removeClass("hover");
                $(scenario).addClass("active");
                $(scenario).find("input").focus().addClass("inlineEditHover").caret(0,0 );
              });

              doc.bind("scenario.hover", function(e, scenario) {
                $(".scenario").removeClass("hover");
                $(scenario).addClass('hover');
              });
              
            },
            
            bindSteps: function() {
              
              $(".add-step").live("click", function() {
                var el = $(this).closest(".scenario-container").find('.steps');
                //console.log(el);
                doc.trigger("step.add", el);
              });
              
              $(".step-container .delete-step").live("click", function() {
                doc.trigger("step.delete", $(this).closest(".step-container"));
              });              
              
              doc.bind('step.activate', function(e, step){
                //console.log('step.activate', step);
                
                $('.scenario li').removeClass('active').removeClass('hover');
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

              doc.bind('step.add', function(e, scenario){
                $(scenario).append(NJ.nup.renderStep());
                doc.trigger('step.activate', $(scenario).find('.step-container:last'));
                //$('.sortable-ui').sortable('refresh');
              });

              doc.bind('step.delete', function(e, step){
                $(step).closest('li').slideUp(300, function(){
                  $(step).remove();
                });
              });              
              
              doc.bind('keyBindings.canDeleteSteps', keyBindings.canDeleteSteps);              

            },

            bindWS: function() {
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
              });
            },
            
            features: function() {

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
                              
              
              // for removing steps in a scenario
              $(".delete-step").live("click", function() {
                doc.trigger('step.delete', this);
              });
                
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
                            DATA.users[uniqueID()] = config.name;
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
                            id: uniqueID(),
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
                              scenario[config.id] = config.value;
                            });
                          }
                          if(config.create) {
                              DATA.features[config.id].scenarios.push({
                                  id: uniqueID(),
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
                    step: function(config) { // breakdowns contains "Steps"

                      // TODO: implement
                      if(config.id) {

                          if(config.update) {
                            $.each(DATA.features[config.id].scenarios, function(i, scenario) {
                              scenario[config.id] = config.value;
                            });
                          }
                          if(config.create) {
                              DATA.features[config.id].scenarios.push({
                                  id: uniqueID(),
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
