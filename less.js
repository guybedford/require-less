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
    var defaultConfig = {};
    var lessConfig = config ? (config.less || config) : defaultConfig;
    if (! ('env' in lessConfig))
      lessConfig.env = 'development';
    var globalLess = window.less;
    if (! globalLess)
        window.less = lessConfig;
    else if (! globalLess.Parser) {
        if (lessConfig === defaultConfig)
          lessConfig = globalLess;
        globalLess = null;
    }

    require(globalLess ? ['./normalize'] : ['./normalize', './lessc'], function(normalize, lessc) {
      if (! lessc)
        lessc = globalLess;

      if (! ("fileExt" in lessConfig))
        lessConfig.fileExt = ".less";
      var fileUrl = lessId;
      if (fileUrl.substring(fileUrl.length - 4) !== ".css" && lessConfig.fileExt)
        fileUrl += lessConfig.fileExt;
      fileUrl = normalize.absoluteURI(req.toUrl(fileUrl), pagePath);

      lessc.render('@import (' + (lessConfig.importOption || 'multiple') + ') "' + fileUrl + '";', lessConfig, function(err, output) {
        if (err)
          return load.error(err);

        lessAPI.inject(normalize(output.css, fileUrl, pagePath));

        setTimeout(load, 7);
      }, lessConfig);

    });
  }
  
  return lessAPI;
});
