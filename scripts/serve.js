var http = require('http'),
    connect = require('connect'),
    morgan = require('morgan'),
    cors = require('cors'),
    serveStatic = require('serve-static'),
    serveIndex = require('serve-index'),
    verbose = process.argv[2] === '--verbose',
    host = process.env.npm_package_config_host || '0.0.0.0',
    port = parseInt(process.env.npm_package_config_port || 8765, 10),
    server = connect()
      .use(morgan('dev', {
        skip: function (request, response) {
          return !verbose && response.statusCode < 400;
        }
      }))
      .use(cors())
      .use(serveStatic('.', {etag: false}))
      .use(serveIndex('.'));

console.log('Starting web server at http://' + host + ':' + port);
http
    .createServer(server)
    .listen(port, host);
