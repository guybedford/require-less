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
  less.load = css.load;
  less._layerBuffer = [];
  
  less.write = function(pluginName, moduleName, write) {
    if (moduleName.substr(0, 2) != '>>')
      css.write.call(less, pluginName, nameLess(moduleName), write, parseLess);
    else
      less.onLayerComplete(moduleName.substr(2), write);
  }
  
  less.onLayerComplete = function(name, write) {
    css.onLayerComplete.call(this, name, write);
  }
  
  return less;
});
