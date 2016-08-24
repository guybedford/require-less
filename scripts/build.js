var ncp = require('ncp').ncp,
    source = 'node_modules/less/dist/less.js',
    target = 'lessc.js';

console.log('Copying ' + source + ' to ' + target + '...');
ncp(source, target, function (error) {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
});
