window.hash = (typeof window.hash != "undefined") ? window.hash : {

  ie:   /MSIE/.test(navigator.userAgent),
  ieSupportBack:  true,
  hash: document.location.hash,
  
  check:  function () {
    var h = document.location.hash;
    if (h != this.hash) {
      this.hash = h;
      
      this.onHashChanged();
    }
  },
  
  init: function () {

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
  
  writeFrame: function (s) {
    var f = document.getElementById("state-frame");
    var d = f.contentDocument || f.contentWindow.document;
    d.open();
    d.write("<script>window._hash = '" + s + "'; window.onload = parent.hash.syncHash;<\/script>");
    d.close();
  },
  
  syncHash: function () {
    var s = this._hash;
    if (s != document.location.hash) {
      document.location.hash = s;
    }
  },
  
  onHashChanged:  function () {}
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
