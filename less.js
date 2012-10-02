define(['css', 'require'], function(css, require) {
  
  var less = {};
  
  less.pluginBuilder = './less-builder';
  
  var nameLess = function(lessId) {
    if (lessId.substr(lessId.length - 1, 1) == '!')
      return lessId.substr(0, lessId.length - 1) + '.less!';
    else
      return lessId + '.less';
  }
  
  //copy api methods from the css plugin
  less.normalize = css.normalize;
  
  less.load = function(lessId, req, load, config) {
    //separately load the parser to avoid building it in
    if (less.parse == undefined) {
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
    css.load(nameLess(lessId), req, load, config, less.parse);
  }
  
  return less;
});
