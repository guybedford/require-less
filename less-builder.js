define(['require', './normalize'], function(req, normalize) {
  var lessAPI = {};
  
  var baseParts = req.toUrl('base_url').split('/');
  baseParts[baseParts.length - 1] = '';
  var baseUrl = baseParts.join('/');

  var nodePrint = function() {};
  if (requirejs.tools)
    requirejs.tools.useLib(function(req) {
      req(['node/print'], function(_nodePrint) {
        nodePrint = _nodePrint;
      }, function(){});
    });
  
  function compress(css) {
    if (typeof process !== "undefined" && process.versions && !!process.versions.node && require.nodeRequire) {
      try {
        var csso = require.nodeRequire('csso');
        var csslen = css.length;
        css = csso.justDoIt(css);
        nodePrint('Compressed CSS output to ' + Math.round(css.length / csslen * 100) + '%.');
        return css;
      }
      catch(e) {
        nodePrint('Compression module not installed. Use "npm install csso -g" to enable.');
        return css;
      }
    }
    nodePrint('Compression not supported outside of nodejs environments.');
    return css;
  }

  function escape(content) {
    return content.replace(/(["'\\])/g, '\\$1')
      .replace(/[\f]/g, "\\f")
      .replace(/[\b]/g, "\\b")
      .replace(/[\n]/g, "\\n")
      .replace(/[\t]/g, "\\t")
      .replace(/[\r]/g, "\\r");
  }

  var config;
  var siteRoot;

  var less = require.nodeRequire('less');
  var path = require.nodeRequire('path');

  var layerBuffer = [];
  var lessBuffer = {};

  lessAPI.normalize = function(name, normalize) {
    if (name.substr(name.length - 5, 5) == '.less')
      name = name.substr(0, name.length - 5);
    return normalize(name);
  }

  var absUrlRegEx = /^([^\:\/]+:\/)?\//;
  
  lessAPI.load = function(name, req, load, _config) {
    //store config
    config = config || _config;

    if (config.modules) {
      //run through the module list - the first one without a layer set is the current layer we are in
      //allows to track the current layer number for layer-specific config
      for (var i = 0; i < config.modules.length; i++)
        if (config.modules[i].layer === undefined) {
          curModule = i;
          break;
        }
    }
    
    siteRoot = siteRoot || path.resolve(config.dir || path.dirname(config.out), config.siteRoot || '.') + '/';

    if (name.match(absUrlRegEx))
      return load();

    var fileUrl = req.toUrl(name + '.less');

    //add to the buffer
    var parser = new less.Parser({
      paths: [baseUrl],
      filename: fileUrl,
      async: false,
      syncImport: true
    });
    parser.parse('@import (multiple) "' + path.relative(baseUrl, fileUrl) + '";', function(err, tree) {
      if (err) {
        return load.error(err);
      }

      var css = tree.toCSS();

      // normalize all imports relative to the siteRoot, itself relative to the output file / output dir
      lessBuffer[name] = normalize(css, fileUrl, siteRoot);

      load();
    });
  }

  var layerBuffer = [];
  
  lessAPI.write = function(pluginName, moduleName, write) {
    if (moduleName.match(absUrlRegEx))
      return load();
    
    layerBuffer.push(lessBuffer[moduleName]);
    
    write.asModule(pluginName + '!' + moduleName, 'define(function(){})');
  }
  
  lessAPI.onLayerEnd = function(write, data) {
    //separateCSS parameter set either globally or as a layer setting
    var separateCSS = false;
    if (config.separateCSS)
      separateCSS = true;
    if (typeof curModule == 'number' && config.modules[curModule].separateCSS !== undefined)
      separateCSS = config.modules[curModule].separateCSS;
    curModule = null;
    
    //calculate layer css
    var css = layerBuffer.join('');
    
    if (separateCSS) {
      nodePrint('Writing CSS! file: ' + data.name + '\n');
      
      var outPath = this.config.appDir ? this.config.baseUrl + data.name + '.css' : cssAPI.config.out.replace(/\.js$/, '.css');
      
      saveFile(outPath, compress(css));
    }
    else {
      if (css == '')
        return;
      write(
        "(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.querySelector('head')[a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})\n"
        + "('" + escape(compress(css)) + "');\n"
      );
    }
    
    //clear layer buffer for next layer
    layerBuffer = [];
  }
  
  return lessAPI;
});
