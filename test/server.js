var server = require('webserver').create();
var page = require('webpage').create();
var fs = require('fs');

var contentTypes = {
  css   : 'text/css',
  html  : 'text/html',
  js    : 'application/javascript',
  png   : 'image/png',
  gif   : 'image/gif',
  jpg   : 'image/jpeg',
  jpeg  : 'image/jpeg'
};

var ip_server = '127.0.0.1:8585';
var listening = server.listen(ip_server, function(req, res) {
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

if (!listening) {
  console.log('could not create web server listening on ' + ip_server);
  phantom.exit();
}

page.open('http://' + ip_server + '/nominatim.html', function (status) {
  if (status !== 'success') {
    console.log('Unable to access network');
    phantom.exit();
  } else {
    console.log('Up and running!');
    phantom.exit();
  }
});
