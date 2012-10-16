define(['css', 'require', './lessc'], function(css, require, lessc) {
  
  var less = {};
  
  less.pluginBuilder = './less-builder';
  
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
  
  if (typeof window == 'undefined') {
    less.load = function(n, r, load) { load(); }
    return less;
  }
  
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
    
    css.load(lessId, req, skipLoad ? function(){} : load, config, less.parse);
    
    if (skipLoad)
      load();
  }
  
  return less;
});
