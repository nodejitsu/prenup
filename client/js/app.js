/* App Start */

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
              return Mustache.to_html($("#step_template").text(), {
                  select: $.jup.html([NJ.nup.renderWordSelector(DAL.get.operators(), pair[0])]),
                  content: pair[1]
                }
              );
        
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
              
              var breakdown = [];
              $.each(scenario.breakdown, function(key, step) {
                  $.each(step, function(key, pair) {
                      breakdown.push(NJ.nup.renderStep(pair));
                  });
              });
              
               return Mustache.to_html($("#scenario_template").text(), {
                    name: scenario.name,
                    steps: breakdown.join("")
                  }
                );
            },
            
            renderFeature: function(i, feature){
              var scenarios = [];
              
              $.each(feature.scenarios, function(key, scenario) {
                  scenarios.push(NJ.nup.renderScenario(key, scenario));
              });
              
               return Mustache.to_html($("#feature_template").text(), {
                    name: feature.name,
                    milestone_id: feature.milestone,
                    scenarios: scenarios.join("")
                  }
                );
            },
            
            renderMilestone: function(key, milestone){
              
               return Mustache.to_html($("#milestone_template").text(), {
                    key: 'ms' + key,
                    milestone: milestone,
                  }
                );
                    
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

                $(document).bind('step.activate', function(e, step){
                  
                  $('.steps li').removeClass('active').removeClass('hover');
                  $(step).addClass('active');
                  $('.steps input').removeClass("inlineEditHover");
                  //console.log($(step).find('input'));
                  $(step).find('input').focus().addClass("inlineEditHover");
                  
                  $(document).unbind('keyBindings.canCycleThroughSteps');
                  $(document).bind('keyBindings.canCycleThroughSteps', keyBindings.canCycleThroughSteps);
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
                  //$('input:focus').blur();
                });

                $(document).bind('scenario.hover', function(e, scenario){
                  $('.scenario').removeClass('hover');
                  $(scenario).addClass('hover');
                });

                $(document).bind('feature.add', function(e, feature){
                  var out = NJ.nup.renderFeature(1, feature);
                  $('#featureslist').append(out);
                  // close all other Featuresaccordions
                  $('#featureslist').accordion( "activate", false);
                  // rebind accordion
                  $(document).trigger('features.applyAccordions');

                });

                $(document).bind('feature.activate', function(e, scenario){
                  //$('.scenario').removeClass('hover');
                  //$(scenario).addClass('hover');
                });

                $(document).bind('feature.feature', function(e, scenario){
                  //$('.scenario').removeClass('hover');
                  //$(scenario).addClass('hover');
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
                  
                  //$("#featureslist").accordion( "activate" , 0 );

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
                    $('#container').fadeIn(1500);
                  },             
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
                        url: '/whatever/someurl', /* TODO: Need real URL to submit to */
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
                
                
                $('.ui-dialog-buttonpane').prepend('<div id="progressBar"/>'); // slight hack to add progressBar to modal
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
                    html.push(NJ.nup.renderFeature(i, feature));                    
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
                  $(this).siblings('ul').append(NJ.nup.renderStep());
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
                  $(this).before(out);
                  
                  $(".scenario").accordion({ 
                    collapsible: true, 
                    autoHeight: false, 
                    active: false

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
               
               keyBindings.canCycleThroughSteps = function(e, originalEvent){

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

               $('input').focus(function(){
                 
                 // TODO: determine if input is inside of Step, this will check whole document
                 var step =  $(this).closest('.step').parent();
                 if(!$(step).hasClass('active')){
                   $(document).trigger('step.activate', step);
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
                project: "My Math Research Project",
                milestones: {
                    "1": "Do Some Math", 
                    "2": "Create a UI"
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

