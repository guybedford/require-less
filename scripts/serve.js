var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    verbose = process.argv[2] === '--verbose',
    server, port;

console.log('Starting a HTTP server...');
server = http.createServer(respond);

port = parseInt(process.env.npm_package_config_port || 8765, 10);
console.log('Listening at the port ' + port + '...');
server.listen(port);

function respond(request, response) {
  if (verbose) {
    console.log(request.method, request.url);
  }
  var pathname = url.parse(request.url).pathname.substring(1);
  if (pathname.indexOf('/') === 0) {
    pathname = pathname.substring(1);
  }
  if (!pathname.length) {
    pathname = 'index.html';
  }
  file(response, pathname);
}

function file(response, pathname) {
  fs.exists(pathname, function (exists) {
    if (exists) {
      fs.readFile(pathname, function (error, content) {
        if (error) {
          console.log('500 Internal server error:', pathname, error);
          response.writeHead(500, { 'Content-Type': 'text/plain' });
          response.write('Internal server error');
        } else {
          var extension = path.extname(pathname).toLowerCase(), type;
          if (extension == '.html') {
            type = 'text/html';
          } else if (extension == '.txt') {
            type = 'text/plain';
          } else if (extension == '.js') {
            type = 'text/javascript';
          } else if (extension == '.css') {
            type = 'text/css';
          } else if (extension == '.gif') {
            type = 'image/gif';
          } else if (extension == '.png') {
            type = 'image/png';
          } else if (extension == '.jpg') {
            type = 'image/jpg';
          } else {
            type = 'application/octet-stream';
          }
          response.writeHead(200, { 'Content-Type': type });
          response.write(content);
        }
        response.end();
      });
    } else {
      console.log('404 Not found:', pathname);
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.write('Not found');
      response.end();
    }
  });
}
