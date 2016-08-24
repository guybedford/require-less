var fs = require('fs');

function copyFile(source, target) {
  console.log('Copying ' + source + ' to ' + target + '...');
  return new Promise(function(resolve, reject) {
    var input = fs.createReadStream(source), output;
    input.on('error', reject);
    output = fs.createWriteStream(target);
    output.on('error', reject);
    output.on('finish', resolve);
    input.pipe(output);
  });
}

copyFile('node_modules/less/dist/less.js', 'lessc.js')
  .then(function () {
    process.exit(0);
  })
  .catch(function (error) {
    console.error(error.message);
    process.exit(1);
  });
