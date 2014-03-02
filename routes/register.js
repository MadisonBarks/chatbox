/**
 * Created by austin on 2/28/14.
 */
exports.get = function (req, res) {
	if((typeof req.session === 'undefined')) {
		console.log("session = undefined");
		res.render('register', {
			login_error : ''
		});
		return;
	} 
	if(req.session !== null 
			&& req.session.authenticated !== null 
			&& req.session.authenticated) {
		res.redirect('box');
	}
	res.render('register', {login_error: ''});
};
exports.post = function (req, res) {
    if(typeof req.session === 'undefined') {
    	console.log("session - undefined");
    }
	if (req.body.username == "" || req.body.password == ""
        || req.body.username == null || req.body.password == null) {
        res.render('register', {login_error: 'You did not fill out all the fields'});
        return;
    }
    var redis = require('redis');
    var client = redis.createClient();

    var username = req.body.username;
    var password = req.body.password;
    var request = req;

    client.get("user:" + username + ":password", function (err, reply) {
        if (!(reply == "" || reply == null)) {
            res.render('register', {login_error: 'Username already exists. Please use another one.'});
            return;
        }
        var bcrypt = require("bcrypt-nodejs");
        bcrypt.hash(password, null, null, function (err, hash) {
            client.set("user:" + username + ":password", hash, function (err, reply) {
                //Nothing here. It's just going to be "OK".
            });
            client.set("user:" + username + ":permissions", "6", function (err, reply) {
                //Nothing here. It's just going to be "OK".
            });
            request.session.authenticated = true;
            request.session.username = username;
            request.session.permlevel = 6;
            console.log("Redirecting to the chatbox.");
            res.redirect('/box');
        });
        
    });
};