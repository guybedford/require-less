define(function(require) {
  var less = require('less');

  var lessAPI = {
    pluginBuilder: './cless-builder'
  };

  if (typeof window === 'undefined') {
    lessAPI.load = function(n, r, load) { load(); };
    return lessAPI;
  }

  lessAPI.load = function(lessId, req, load, config) {
    if (!config) config = {};
    if (!config.less) config.less = {};
    var inject = config.less.inject;
    if (!inject) config.less.inject = false;
    less.load.call(this, lessId, req, load, config);
    if (config.less.inject !== inject) config.less.inject = inject;
  };

  return lessAPI;
});
