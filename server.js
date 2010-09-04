var sys = require('sys'), querystring = require('querystring'), url = require('url');
var static = require('./vendor/node-static/lib/node-static');
var kyuri = require('./vendor/kyuri/lib/kyuri');


//
// Create a node-static server to serve the current directory
//
var file = new(static.Server)('./client', { cache: 7200, headers: {'X-Hello':'World!'} });

require('http').createServer(function (req, resp) {
    
    req.body = '';

    req.addListener('data',function(chunk){
      req.body += chunk
    })
    
    req.addListener('end', function () {
        // Remark: here is an example of a simple router with node-static fallback 
        if(req.url == '/'){
          req.url = "index.html";
        }
        if(req.url == '/export'){
              var httpParams = {};
              req.uri = url.parse(req.url);
              if(typeof req.uri.query == 'undefined'){req.uri.query = '';}
              req.uri.params = querystring.parse(req.uri.query);
              // request.uri.params
              var jsonAST = JSON.parse(req.body.toString());
              // request processing logic goes here
              resp.writeHead(200, {'Content-Type': 'application/json'});
              resp.write(JSON.stringify(kyuri.compile(jsonAST)));
              resp.end();
        }
        else{
          file.serve(req, resp, function (err, res) {
              if (err) { // An error as occured
                  sys.error("> Error serving " + req.url + " - " + err.message);
                  resp.writeHead(err.status, err.headers);
                  resp.end();
              } else { // The file was served successfully
                  sys.puts("> " + req.url + " - " + res.message);
              }
          });
        }
    });
}).listen(process.ENV.port || 8080);

sys.puts("> prenup is listening on http://127.0.0.1:8080");
 