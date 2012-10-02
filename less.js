define(['css', './lessc'], function(css, lessc) {
  
  var less = {};
  
  less.pluginBuilder = './less-builder';
  
  var parser = new lessc.Parser();
  
  var parseLess = function(less) {
    var css;
    parser.parse(less, function(err, tree) {
      if (err)
        throw err;
      css = tree.toCSS();
    });
    return css;
  }
  
  var nameLess = function(lessId) {
    if (lessId.substr(lessId.length - 1, 1) == '!')
      return lessId.substr(0, lessId.length - 1) + '.less!';
    else
      return lessId + '.less';
  }
  
  //copy api methods from the css plugin
  less.normalize = css.normalize;
  
  less.load = function(lessId, req, load, config) {
    css.load(nameLess(lessId), req, load, config, parseLess);
  }
  
  return less;
});
