# App Starts
stop = false
jQuery($ -> 
    ( -> 
        options = $.querystring.toJSON()
        context = DAL = DATA = null
        Main: -> APP.exec.call(this, {

                ns: "NJ.nup", #namespace

                plan: [ #execution plan 
                    "pageLoad"
                    ,"determineContext"
                ]
            })
        renderStep: (pair) -> 
            pair = ["foo"] if pair is "undefined"
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
            ]
        renderWordSelector: (data, value) -> 
            return ["select", [
                ->
                options = [];
                for operator in data
                    selected = if value.toLowerCase() is operator.toLowerCase() then  { "selected": "true" } else {}
                    options.push($.jup.html(["option", selected, operator]))
                    return options
            ]
        ]
        renderScenario: (key, scenario) -> 
             ["div", { "class": "scenario" },
                 ["h3", { "class": "breakdown" },
                     ["input", { "type": "text", "value": scenario.name }],
                     ["div", { "class": "remove delete-scenario ui-state-default ui-corner-all", "title": "Remove scenario" }, 
                         ["span", "&nbsp"]
                     ]
                     ],
                     ["div", ->
                        breakdown = ["<ul class='sortable-ui steps'>"]
                        for key, step of scenario.breakdown
                            for key, pari of step
                                breakdown.push($.jup.html(NJ.nup.renderStep(pair)))
                        breakdown.push("</ul>");
                        return breakdown.join("") + $.jup.html(['button',{ "class": "add-step" }, 'Add Step +'])
                ]
            ]
    )
)
