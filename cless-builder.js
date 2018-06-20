define(function(require) {
	var less = require('less-builder');
	var lessAPI = {};

	for (var key in less) {
		if (!less.hasOwnProperty(key)) return;
		lessAPI[key] = less[key];
	}

  lessAPI.load = function(lessId, req, load, config) {
		if (!config) config = {};
		if (!config.less) config.less = {};
		var savedState = config.less.component;
		if (!savedState) config.less.component = true;
		less.load.call(this, lessId, req, load, config);
		if (config.less.component !== savedState) config.less.component = savedState;
	};

	return lessAPI;
});
