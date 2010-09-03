var sys = require('sys');
var static = require('./vendor/node-static/lib/node-static');
var kyuri = require('./vendor/kyuri/lib/kyuri');


//
// Create a node-static server to serve the current directory
//
var file = new(static.Server)('./client', { cache: 7200, headers: {'X-Hello':'World!'} });

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        if(request.url == '/'){
          request.url = "index.html";
        }

        if(request.url == '/export'){
          response.writeHead(200, {'Content-Type':'text/plain'} );
          response.write('foo');
          response.end();
        }

        file.serve(request, response, function (err, res) {
            if (err) { // An error as occured
                sys.error("> Error serving " + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end();
            } else { // The file was served successfully
                sys.puts("> " + request.url + " - " + res.message);
            }
        });
    });
}).listen(8080);

sys.puts("> nuptials is listening on http://127.0.0.1:8080");
 