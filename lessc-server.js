define(['./lessc'], function(less) {
    var fs = require.nodeRequire('fs');
    var path = require.nodeRequire('path');

    less.Parser.importer = function (file, paths, callback, env) {
        console.log('importing ' + file);
        var pathname, data;

        // TODO: Undo this at some point,
        // or use different approach.
        var paths = [].concat(paths);
        paths.push('.');

        for (var i = 0; i < paths.length; i++) {
            try {
                pathname = path.join(paths[i], file);
                fs.statSync(pathname);
                break;
            } catch (e) {
                pathname = null;
            }
        }
        
        paths = paths.slice(0, paths.length - 1);

        if (!pathname) {
            if (typeof(env.errback) === "function") {
                env.errback(file, paths, callback);
            } else {
                callback({ type: 'File', message: "'" + file + "' wasn't found.\n" });
            }
            return;
        }

        function parseFile(e, data) {
            if (e) return callback(e);
                env.contents = env.contents || {};
                env.contents[pathname] = data;      // Updating top importing parser content cache.
            new(less.Parser)({
                    paths: [path.dirname(pathname)].concat(paths),
                    filename: pathname,
                    contents: env.contents,
                    files: env.files,
                    syncImport: env.syncImport,
                    dumpLineNumbers: env.dumpLineNumbers
            }).parse(data, function (e, root) {
                    callback(e, root, pathname);
            });
        };

        if (env.syncImport) {
            try {
                data = fs.readFileSync(pathname, 'utf-8');
                parseFile(null, data);
            } catch (e) {
                parseFile(e);
            }
        } else {
            fs.readFile(pathname, 'utf-8', parseFile);
        }
    }
    return less;
});