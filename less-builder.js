define(['require', './normalize'], function(req, normalize) {
  var lessAPI = {};

  var isWindows = !!process.platform.match(/^win/);
  
  var baseParts = req.toUrl('base_url').split('/');
  baseParts[baseParts.length - 1] = '';
  var baseUrl = baseParts.join('/');
  
  function compress(css) {
    if (typeof process !== "undefined" && process.versions && !!process.versions.node && require.nodeRequire) {
      try {
        var csso = require.nodeRequire('csso');
      }
      catch(e) {
        console.log('Compression module not installed. Use "npm install csso -g" to enable.');
        return css;
      }
      try {
        var csslen = css.length;
        css = csso.justDoIt(css);
        console.log('Compressed CSS output to ' + Math.round(css.length / csslen * 100) + '%.');
        return css;
      }
      catch(e) {
        console.log('Unable to compress css.\n' + e);
        return css;
      }

    }
    console.log('Compression not supported outside of nodejs environments.');
    return css;
  }
  function saveFile(path, data) {
    if (typeof process !== "undefined" && process.versions && !!process.versions.node && require.nodeRequire) {
      var fs = require.nodeRequire('fs');
      fs.writeFileSync(path, data, 'utf8');
    }
    else {
      var content = new java.lang.String(data);
      var output = new java.io.BufferedWriter(new java.io.OutputStreamWriter(new java.io.FileOutputStream(path), 'utf-8'));
  
      try {
        output.write(content, 0, content.length());
        output.flush();
      }
      finally {
        output.close();
      }
    }
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

    if (!siteRoot) {
      siteRoot = path.resolve(config.dir || path.dirname(config.out), config.siteRoot || '.') + '/';
      if (isWindows)
        siteRoot = siteRoot.replace(/\\/g, '/');
    }

    if (name.match(absUrlRegEx))
      return load();

    var fileUrl = req.toUrl(name + '.less');

    //add to the buffer
    var parser = new less.Parser({
      paths: [baseUrl],
      filename: fileUrl,
      async: false,
      syncImport: true,
      relativeUrls: config.less && config.less.relativeUrls
    });
    parser.parse('@import (multiple) "' + path.relative(baseUrl, fileUrl) + '";', function(err, tree) {
      if (err) {
        console.log(err + ' at ' + path.relative(baseUrl, err.filename) + ', line ' + err.line);
        return load.error(err);
      }

      var css = tree.toCSS(config.less);

      // normalize all imports relative to the siteRoot, itself relative to the output file / output dir
      lessBuffer[name] = normalize(css, isWindows ? fileUrl.replace(/\\/g, '/') : fileUrl, siteRoot);

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
    
    //calculate layer css
    var css = layerBuffer.join('');
    
    if (config.separateCSS) {
      console.log('Writing CSS! file: ' + data.name + '\n');
      
      var outPath = config.appDir ? config.baseUrl + data.name + '.css' : config.out.replace(/\.js$/, '.css');

      css = normalize(css, siteRoot, outPath);
      
      saveFile(outPath, compress(css));
    }
    else {
      if (css == '')
        return;
      write(
        "(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})\n"
        + "('" + escape(compress(css)) + "');\n"
      );
    }
    
    //clear layer buffer for next layer
    layerBuffer = [];
  }
  
  return lessAPI;
});
