var exec = require('child_process').exec,
    verbose = process.argv[2] === '--verbose',
    command = 'node ../vendor/r.js -o build.js',
    failed;

function build(directories) {
  var directory = directories.shift();
  if (directory) {
    directory = 'test/' + directory;
    exec(command, {cwd: directory}, function (error, stdout, stderr) {
      console.log('> cd ' + directory + ' && ' + command);
      if (error) {
        failed = true;
        console.error('Error:', error.message);
      }
      if (error || verbose) {
        console.log(stdout);
        console.log(stderr);
      }
      build.call(null, directories);
    });
  } else {
    process.exit(failed ? 1 : 0);
  }
}

build([
  'support-less-v1',
  'support-less-v2',
  'support-separate-css'
]);
