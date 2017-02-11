// eslint-disable-next-line no-use-before-define
var require = patchRequire(require);
// path here is relative to where this will be injected
var fs       = require('fs');
var server   = require('webserver').create();
var config   = require('../config');

if (!phantom.casperLoaded) {
  console.warn('This script must be invoked using the casperjs executable');
  phantom.exit(1);
}

// server
server.listen('127.0.0.1:' + config.port, function (req, res) {
  var file_path = fs.workingDirectory + req.url,
      ext = req.url.substring(req.url.indexOf('.') + 1),
      file = '',
      contentTypes = {
        png   : 'image/png',
        gif   : 'image/gif',
        jpg   : 'image/jpeg',
        jpeg  : 'image/jpeg',
        css   : 'text/css',
        html  : 'text/html',
        js    : 'application/javascript'
      };

  res.statusCode = 200;
  res.headers = {
    'Cache': 'no-cache',
    'Content-Type': contentTypes[ext] || 'text/html'
  };
  if (fs.isReadable(file_path)) {
    file = fs.read(file_path);
  } else {
    res.statusCode = 404;
    casper.echo('Can\'t find file: ' + file_path, 'ERROR');
    casper.exit();
  }
  res.write(file);
  res.close();
});

casper.on('resource.received', function (resource) {
//   this.echo(resource.url + " is OK", "INFO");
});

// test suites completion listener
casper.test.on('tests.complete', function () {
  server.close();
});
