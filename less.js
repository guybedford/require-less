define(['require'], function(require) {
  
  var lessAPI = {};
  
  lessAPI.pluginBuilder = './less-builder';
  
  if (typeof window == 'undefined') {
    lessAPI.load = function(n, r, load) { load(); }
    return lessAPI;
  }
  
  lessAPI.normalize = function(name, normalize) {
    if (name.substr(name.length - 5, 5) == '.less')
      name = name.substr(0, name.length - 5);

    name = normalize(name);

    return name;
  }
  
  var head = document.getElementsByTagName('head')[0];

  var base = document.getElementsByTagName('base');
  base = base && base[0] && base[0] && base[0].href;
  var pagePath = (base || window.location.href.split('#')[0].split('?')[0]).split('/');
  pagePath[pagePath.length - 1] = '';
  pagePath = pagePath.join('/');

  var styleCnt = 0;
  var curStyle;
  lessAPI.inject = function(css) {
    if (styleCnt < 31) {
      curStyle = document.createElement('style');
      curStyle.type = 'text/css';
      head.appendChild(curStyle);
      styleCnt++;
    }
    if (curStyle.styleSheet)
      curStyle.styleSheet.cssText += css;
    else
      curStyle.appendChild(document.createTextNode(css));
  }

  lessAPI.load = function(lessId, req, load, config) {
    window.less = config.less || {};
    window.less.env = 'development';

    require(['./lessc', './normalize'], function(lessc, normalize) {

      var fileUrl = req.toUrl(lessId + '.less');
      fileUrl = normalize.absoluteURI(fileUrl, pagePath);

      //make it compatible with v1 and v2
      var generation = (lessc.version || [1])[0];
      var renderer;
      var cssGetter;
      if (generation === 1) {
        //v1, use parser and toCSS
        var parser = new lessc.Parser(window.less);
        renderer = function (input, cb) {
          parser.parse.call(parser, input, cb, window.less);
        };
        cssGetter = function (tree) {
          return tree.toCSS(config.less);
        };
      } else if (generation >= 2) {
        //v2 or newer, use render and output
        renderer = function (input, cb) {
          lessc.render(input, window.less, cb);
        };
        cssGetter = function (output) {
          return output.css;
        };
      }

      renderer('@import (multiple) "' + fileUrl + '";', function(err, output) {
        if (err) {
          console.log(err + ' at ' + fileUrl + ', line ' + err.line);
          return load.error(err);
        }
        var css = cssGetter(output);
        lessAPI.inject(normalize(css, fileUrl, pagePath));

        setTimeout(load, 7);
      }, window.less);

    });
  }
  
  return lessAPI;
});
