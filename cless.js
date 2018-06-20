define(function(require) {
	var less = require('less');

	var lessAPI = {
		pluginBuilder: './wl-requirejs-less-builder'
	};

	if (typeof window === 'undefined') {
		lessAPI.load = function(n, r, load) { load(); };
		return lessAPI;
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
