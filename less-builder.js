define(['require-css/css-builder', './lessc'], function(css, lessc) {
  var less = {};
  
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
  
  less.defined = {};
  
  less.normalize = css.normalize;
  less.set = css.set;
  less.loadFile = css.loadFile;
  less.load = function(name, req, load, config) {
    css.load(name, req, load, config);
  }
  
  less._layerBuffer = [];
  
  less.write = function(pluginName, moduleName, write) {
    css.write(pluginName, nameLess(moduleName), write, parseLess);
  }
  
  less.onLayerEnd = function(write, data) {
    css.onLayerEnd(write, data);
  }
  
  return less;
});
