/**
 * Module dependencies.
 */

var express = require('express.io');
var login = require('./routes/login');
var register = require('./routes/register');
var box = require('./routes/box');
var path = require('path');

var app = express().http().io();

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

app.use(express.cookieParser());

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

app.listen(80);
//==================================================================
//======================BELOW IS SOCKET ONLY========================
//==================================================================

var redis = require('redis');
var client = redis.createClient();

//Delete ALL previous "online" users.
client.del("online", function(err, reply) {});

app.io.route('chatmessage', function(req) {
	if(req.session.authenticated === null) {
		req.io.disconnect();
		return;
	}
	req.io.broadcast('chatmessage', req.session.username, req.data.msg);
});

/*
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
        console.log("Chat message received from " + session.username);
    });
    socket.on('disconnect', function () {
        socket.broadcast.emit('userdisconnect', session.username);
        client.srem('online', session.username, function (err,reply) {
        });
    });
});
*/