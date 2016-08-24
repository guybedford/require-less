var cwd = require('fs').workingDirectory,
    args = require('system').args,
    verbose = args[1] === '--verbose',
    page = require('webpage').create(),
    failed;

page.onConsoleMessage = function (message, line, source) {
  if (verbose) {
    console.log(message);
    if (source) {
      console.log('  (' + source + ', line ' + line + ')');
    }
  }
};

function run(directories) {
  var directory = directories.shift(), url;
  if (directory) {
    url = 'file://' + cwd + '/test/' + directory + '/test.html';
    console.log('> open ' + url);
    console.log('');
    page.open(url, function (status) {
      var retries, interval;
      if (status === 'success') {
        retries = 0;
        interval = setInterval(function () {
          var bodyText = page.evaluate(function () {
            return document.body.innerText;
          }).trim();
          if (bodyText !== 'loading...') {
            clearInterval(interval);
            if (bodyText !== 'succeeded') {
              failed = true;
            }
            console.log('Testing ' + bodyText + '.');
            console.log('');
            run.call(null, directories);
          } else {
            if (++retries === 100) {
              clearInterval(interval);
              failed = true;
              console.error('Testing timed out.');
              console.log('');
              run.call(null, directories);
            }
          }
        }, 10);
      } else {
        failed = true;
        console.error('Opening failed.');
        console.log('');
        run.call(null, directories);
      }
    });
  } else {
    phantom.exit(failed ? 1 : 0);
  }
}

run([
  'less1',
  'less1-separate-css',
  'less2',
  'less2-separate-css',
]);
