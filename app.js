/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var login = require('./routes/login');
var register = require('./routes/register');
var box = require('./routes/box');
var http = require('http');
var path = require('path');
var io = require("socket.io");
var sio = require("session.socket.io");

var app = express();

var server = http.createServer(app);

var donotuse = io.listen(server);
donotuse.set('log level', 3);
//donotuse.set("origins", "chatbox.fullhousedev.com:*");

server.listen(4000);

var RedisStore = require("connect-redis")(express);

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

var cookieParser = express.cookieParser();

app.use(cookieParser);

var redisStore = new RedisStore({
    host: 'localhost',
    port: 6379,
    db: 'database'
});

app.use(express.session({
    store: redisStore,
    secret: 'fdghodflghoesriulhdaeasgdfiulghdsfuilsridfkjvcn'
}));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', login.get);
app.get('/login', login.get);
app.post('/login', login.post);
app.get('/box', box.index);
app.get('/register', register.get);
app.post('/register', register.post);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

//==================================================================
//======================BELOW IS SOCKET ONLY========================
//==================================================================

var socketIO = new sio(donotuse, redisStore, cookieParser);

var redis = require('redis');
var client = redis.createClient();

socketIO.on('connection', function (err, socket, session) {
    if (session.authenticated == null || !session.authenticated) {
        socket.disconnect();
    }
    socket.broadcast.emit('userconnect', session.username);
    console.log("User connected: " + session.username);
    client.sadd('online', session.username, function () {
    });
    //The user is authenticated. We're clear to proceed.
    socket.set('username', session.username);
    socket.set('permLevel', session.permlevel);
    socket.on('chatmessage', function (msg) {
        socket.broadcast.emit('chatmessage', session.username, msg);
    });
    socket.on('disconnect', function () {
        socket.broadcast.emit('userdisconnect', session.username);
        client.srem('online', session.username, function () {
        });
    });
});