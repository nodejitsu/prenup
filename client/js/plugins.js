
window.log = function(){
  log.history = log.history || []; 
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};

if(typeof console == 'undefined'){
  var console = {};
  console.log = function(){return false;}
}

(function(doc){
  var write = doc.write;
  doc.write = function(q){ 
    log('document.write(): ',arguments); 
    if (/docwriteregexwhitelist/.test(q)) write.apply(doc,arguments);  
  };
})(document);



/*
 * jQuery Caret Range plugin
 * Copyright (c) 2009 Matt Zabriskie
 * Released under the MIT and GPL licenses.
 */
(function($) {
  $.extend($.fn, {
    caret: function (start, end) {
      var elem = this[0];

      if (elem) {             
        // get caret range
        if (typeof start == "undefined") {
          if (elem.selectionStart) {
            start = elem.selectionStart;
            end = elem.selectionEnd;
          }
          else if (document.selection) {
            var val = this.val();
            var range = document.selection.createRange().duplicate();
            range.moveEnd("character", val.length)
            start = (range.text == "" ? val.length : val.lastIndexOf(range.text));

            range = document.selection.createRange().duplicate();
            range.moveStart("character", -val.length);
            end = range.text.length;
          }
        }
        // set caret range
        else {
          var val = this.val();

          if (typeof start != "number") start = -1;
          if (typeof end != "number") end = -1;
          if (start < 0) start = 0;
          if (end > val.length) end = val.length;
          if (end < start) end = start;
          if (start > end) start = end;

          elem.focus();

          if (elem.selectionStart) {
            elem.selectionStart = start;
            elem.selectionEnd = end;
          }
          else if (document.selection) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveStart("character", start);
            range.moveEnd("character", end - start);
            range.select();
          }
        }

        return {start:start, end:end};
      }
    }
  });
})(jQuery);