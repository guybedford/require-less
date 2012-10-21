define(['require-css/css-builder', './lessc'], function(css, lessc) {
  var less = {};
  
  var parser = new lessc.Parser();
  var parseLess = function(less) {
    var CSS;
    parser.parse(less, function(err, tree) {
      if (err)
        throw err;
      CSS = tree.toCSS();
    });
    return CSS;
  }

  less.normalize = function(name, normalize) {
    if (name.substr(name.length - 1, 1) == '!')
      name = name.substr(0, name.length - 1);
    if (name.substr(name.length - 5, 5) == '.less')
      name = name.substr(0, name.length - 5);
    return normalize(name);
  }
  
  less.load = function(name, req, load, config) {
    css.load(name + '.less', req, load, config);
  }
  
  less.write = function(pluginName, moduleName, write) {
    css.write(pluginName, moduleName, write, 'less', parseLess);
  }
  
  less.onLayerEnd = function(write, data) {
    css.onLayerEnd(write, data);
  }
  
  return less;
});
