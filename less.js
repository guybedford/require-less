define(['css', 'require'], function(css, require) {
  
  var less = {};
  
  less.pluginBuilder = './less-builder';
  
  //copy api methods from the css plugin
  less.normalize = css.normalize;
  
  less.load = function(lessId, req, load, config) {
    var skipLoad = false;
    if (lessId.substr(lessId.length - 1, 1) == '!') {
      lessId = lessId.substr(0, lessId.length - 1);
      skipLoad = true;
    }
    
    if (lessId.substr(lessId.length - 5, 5) != '.less')
      lessId += '.less';
    
    //separately load the parser to avoid building it in
    if (less.parse == undefined && !css.defined[lessId]) {
      require(['./lessc'], function(lessc) {
        var parser = new lessc.Parser();
        less.parse = function(less) {
          var css;
          parser.parse(less, function(err, tree) {
            if (err)
              throw err;
            css = tree.toCSS();
          });
          //instant callback luckily
          return css;
        }
        less.load(lessId, req, load, config);
      });
      return false;
    }
    
    css.load(lessId, req, skipLoad ? function(){} : load, config, less.parse);
    
    if (skipLoad)
      load();
  }
  
  return less;
});
