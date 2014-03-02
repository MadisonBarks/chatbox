/*
 * Created by austin on 2/26/14.
 */

exports.get = function(req, res) {
	if(req.session !== null && req.session.authenticated !== null 
			&& req.session.authenticated) {
		res.redirect('login');
	}
	res.render('login', {
		login_error : ''
	});
	console.log(req.session);
};
exports.post = function(req, res) {
	if (req.body.username == "" || req.body.password == ""
			|| req.body.username == null || req.body.password == null) {
		res.render('login', {
			login_error : 'You did not fill out all the fields'
		});
		return;
	}
	console.log(req.session);
	console.log(req);
	var redis = require('redis');
	var bcrypt = require('bcrypt-nodejs');
	var client = redis.createClient();

	var username = req.body.username;
	var password = req.body.password;

	client.get("user:" + username + ":password", function(err, reply) {
		if (reply == "" || reply == null) {
			res.render('login', {
				login_error : 'Username or password is incorrect.'
			});
			return;
		}
		bcrypt.compare(password, reply, function(err, valid) {
			if (!valid) {
				res.render('login', {
					login_error : 'Username or password is incorrect'
				});
				return;
			}
			var S = require("string");
			client.get("user:" + username + ":permissions",
					function(err, reply) {
						if (S(reply).contains(";")) {
							req.session.authenticated = true;
							req.session.username = username;
							req.session.permlevel = S(reply).split(';')[0];
							req.session.suffix = S(reply).split(';')[1];

							client.sadd("online", username,
									function(err, reply) {
										// We do nothing with the information.
										// It's just "OK" anyways.
									});
							res.redirect('/box');

						} else {
							req.session.authenticated = true;
							req.session.username = username;
							req.session.permlevel = reply;

							client.sadd("online", username,
									function(err, reply) {
										// We do nothing with the information.
										// It's just "OK" anyways.
									});
							res.redirect('/box');
						}
					});
		});
	});
};