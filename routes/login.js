/*
 * Created by austin on 2/26/14.
 */

exports.get = function(req, res) {
	if((typeof req.session === 'undefined')) {
		console.log("session = undefined");
		res.render('login', {
			login_error : ''
		});
		return;
	} 
	if(req.session !== null 
			&& req.session.authenticated !== null 
			&& req.session.authenticated) {
		res.redirect('box');
	}
	res.render('login', {
		login_error : ''
	});
};
exports.post = function(req, res) {
	if(typeof req.session === 'undefined') {
    	console.log("session - undefined");
    	res.status(500).render('errors/500', {error_info: 'Session was undefined in login'});
    	return;
    }
	if (req.body.username == "" || req.body.password == ""
			|| req.body.username == null || req.body.password == null) {
		res.render('login', {
			login_error : 'You did not fill out all the fields'
		});
		return;
	}
	console.log(req.session);
	var redis = require('redis');
	var bcrypt = require('bcrypt-nodejs');
	var client = redis.createClient();

	var username = req.body.username;
	var password = req.body.password;
	request = req;

	client.get("user:" + username + ":password", function(err, reply) {
		if (reply == "" || reply == null) {
			res.render('login', {
				login_error : 'Username or password is incorrect.'
			});
			return;
		}
		console.log(request.session);
		bcrypt.compare(password, reply, function(err, valid) {
			if (!valid) {
				res.render('login', {
					login_error : 'Username or password is incorrect'
				});
				return;
			}
			console.log(request.session);
			var S = require("string");
			client.get("user:" + username + ":permissions",
					function(err, reply) {
						console.log(request.session);
						if (S(reply).contains(";")) {
							request.session.authenticated = true;
							request.session.username = username;
							request.session.permlevel = S(reply).split(';')[0];
							request.session.suffix = S(reply).split(';')[1];

							client.sadd("online", username,
									function(err, reply) {
										// We do nothing with the information.
										// It's just "OK" anyways.
									});
							res.redirect('/box');

						} else {
							client.sadd("online", username,
									function(err, reply) {
										request.session.authenticated = true;
										request.session.username = username;
										request.session.permlevel = reply;
										res.redirect('/box');
									});
						}
			});
		});
	});
};