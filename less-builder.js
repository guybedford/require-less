define(['require', './normalize'], function(req, normalize) {
  var lessAPI = {};

  var isWindows = !!process.platform.match(/^win/);
  var normalizeWinPath = function(path) {
    return isWindows ? path.replace(/\\/g, '/') : path;
  };

  var baseParts = normalizeWinPath(req.toUrl('base_url')).split('/');
  baseParts[baseParts.length - 1] = '';
  var baseUrl = baseParts.join('/');

  function compress(css) {
    var csso, csslen;
    if (config.optimizeCss == 'none') {
      return css;
    }
    if (typeof process !== "undefined" && process.versions && !!process.versions.node && require.nodeRequire) {
      try {
        csso = require.nodeRequire('csso');
      }
      catch(e) {
        console.log('Compression module not installed. Use "npm install csso -g" to enable.');
        return css;
      }
      try {
        csslen = css.length;
        if (typeof csso.minify === 'function') {
          css = csso.minify(css).css;
        } else {
          css = csso.justDoIt(css);
        }
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
  var inject;
  var siteRoot;

  var less = require.nodeRequire('less');
  var path = require.nodeRequire('path');

  var layerBuffer = [];
  var lessBuffer = {};

  lessAPI.normalize = function(name, normalize) {
    if (name.substr(name.length - 5, 5) == '.less')
      name = name.substr(0, name.length - 5);
    return normalize(name);
  };

  var absUrlRegEx = /^([^\:\/]+:\/)?\//;

  lessAPI.load = function(name, req, load, _config) {
    //store config
    config = config || _config;

    if (!siteRoot) {
      siteRoot = path.resolve(
        config.dir || path.dirname(
          typeof config.out === 'string' ? config.out : ''
        ),
        config.siteRoot || '.'
      ) + '/';
      siteRoot = normalizeWinPath(siteRoot);
    }

    if (name.match(absUrlRegEx))
      return load();

    var fileUrl = normalizeWinPath(req.toUrl(name + '.less'));

    //add to the buffer
    var cfg = _config.less || {};
    cfg.paths = [baseUrl].concat(cfg.paths || []);
    cfg.filename = fileUrl;
    cfg.async = false;
    cfg.syncImport = true;

    inject = cfg.inject;

    //make it compatible with v1 and v2
    var generation = less.version[0];
    var renderer;
    var cssGetter;
    if (generation === 1) {
      //v1, use parser and toCSS
      var parser = new less.Parser(cfg);
      renderer = function (input, cb) {
        parser.parse.call(parser, input, cb, cfg);
      };
      cssGetter = function (tree) {
        return tree.toCSS(config.less);
      };
    } else if (generation >= 2) {
      //v2 or newer, use render and output
      renderer = function (input, cb) {
        less.render(input, cfg, cb);
      };
      cssGetter = function (output) {
        return output.css;
      };
    }

    renderer('@import (multiple) "' + path.relative(baseUrl, fileUrl) + '";', function (err, output) {
      if (err) {
        console.log(err + ' at ' + path.relative(baseUrl, err.filename) + ', line ' + err.line);
        return load.error(err);
      }
      var css = cssGetter(output);
      // normalize all imports relative to the siteRoot, itself relative to the output file / output dir
      lessBuffer[name] = normalize(css, fileUrl, siteRoot);

      load();
    });
  };

  lessAPI.write = function(pluginName, moduleName, write) {
    if (moduleName.match(absUrlRegEx))
      return;

    var css = lessBuffer[moduleName];
    layerBuffer.push(css);

    //use global variable to combine plugin results with results of require-css plugin
    if (!global._requirejsCssData) {
      global._requirejsCssData = {
        usedBy: {less: true},
        css: ''
      };
    } else {
      global._requirejsCssData.usedBy.less = true;
    }

    var moduleContent = inject ? '' : "return '" + escape(compress(css)) + "'";
    write.asModule(pluginName + '!' + moduleName, 'define(function(){' + moduleContent + '});');
  };

  lessAPI.onLayerEnd = function(write, data) {
    if (inject === false) return;

    //calculate layer css
    var css = layerBuffer.join('');

    if (config.separateCSS) {
      console.log('Writing CSS! file: ' + data.name + '\n');

      var outPath = config.dir ? path.resolve(config.dir, config.baseUrl, data.name + '.css') : config.out.replace(/(\.js)?$/, '.css');
      outPath = normalizeWinPath(outPath);

      css = normalize(css, siteRoot, outPath);

      process.nextTick(function() {
        if (global._requirejsCssData) {
          css = global._requirejsCssData.css = css + global._requirejsCssData.css;
          delete global._requirejsCssData.usedBy.less;
          if (Object.keys(global._requirejsCssData.usedBy).length === 0) {
            delete global._requirejsCssData;
          }
        }

        saveFile(outPath, compress(css));
      });
    }
    else {
      if (css === '')
        return;
      write(
        "(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})\n" +
        "('" + escape(compress(css)) + "');\n"
      );
    }

    //clear layer buffer for next layer
    layerBuffer = [];
  };

  return lessAPI;
});
