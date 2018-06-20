define(function(require) {
  var less = require('less-builder');
  var lessAPI = {};

  for (var key in less) {
    if (!less.hasOwnProperty(key)) continue;
    lessAPI[key] = less[key];
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
