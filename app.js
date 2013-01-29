
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

var app = express();
var controller = require("./controller");

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set("view options", {layout: false});
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    var cmd = req.query.cmd;
    
    if (cmd == 'getMessages') {
        routes.getMessages(req, res);
        return;
    }

    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

var server = http.createServer(app),
io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    var ctl = new controller.Controller(io, socket);
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
