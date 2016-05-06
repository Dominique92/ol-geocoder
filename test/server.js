var contentTypes = {
  css   : 'text/css',
  html  : 'text/html',
  js    : 'application/javascript',
  png   : 'image/png',
  gif   : 'image/gif',
  jpg   : 'image/jpeg',
  jpeg  : 'image/jpeg'
};

exports.create = function(port) {
  port = port || 8888;
  
  var server = require('webserver').create(),
      page = require('webpage').create(),
      fs = require('fs');
  
  server.listen(port, function(req, res) {
    var file_path = fs.workingDirectory + req.url;
    var ext = req.url.substring(req.url.indexOf('.') + 1);
    var file = '';
    
    res.statusCode = 200;
    res.headers = {
      'Cache': 'no-cache', 
      'Content-Type': contentTypes[ext] || 'text/html'
    };
    if (fs.isReadable(file_path)) {
      file = fs.read(file_path);
    } else {
      res.statusCode = 404;
    }
    res.write(file);
    res.close();
  });
  
  return server;
};
