require-less
===========

Optimizable LESS requiring with RequireJS

Based on the [require-css module](https://github.com/guybedford/require-css), read the documentation there for usage instruactions.

Basic Overview
--------------

Allows the construction of scripts that can require LESS files, using the simple RequireJS syntax:

```javascript
define(['less!styles/main'], function() {
  //code that requires the stylesheet: styles/main.less
});
```

When run the in the browser, less is downloaded, parsed and injected. When running a build with the RequireJS optimizer, less is compiled into the build layers dynamically as css with compression support.

Installation and Setup
----------------------

Download the require-less folder manually or use [volo](https://github.com/volojs/volo)(`npm install volo -g`):

```
volo add guybedford/require-less
```

Volo will automatically install the text plugin and require-css, which are needed dependencies.

For a manual install, download them at:
* [Text plugin](https://raw.github.com/requirejs/text/latest/text.js)
* [RequireCSS](https://github.com/guybedford/require-css/zipball/master)

and copy them into the baseUrl folder.

Then add the following [map configuration](http://requirejs.org/docs/api.html#config-map) in RequireJS:

```javascript
map: {
  '*': {
    'css': 'require-css/css',
    'less': 'require-less/less'
  }
}
```

Differences with Require-LESS
-----------------------------

Basically, everywhere you would have written `css!` (including all build configuration), simply replace this with `less!`.

CSS and LESS running together are compiled as separate buffers.
