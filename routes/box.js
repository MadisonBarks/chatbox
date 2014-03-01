/**
 * Created by austin on 2/28/14.
 */
exports.index = function (req, res) {
    if (req.session == null || req.session.authenticated == null || !req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    //Implement checking for tempbans and bans.
    //Or should that be implemented in the login script?

    var redis = require("redis");
    var client = redis.createClient();

    client.smembers("online", function (err, onlineMembers) {
        res.render('box', {online: onlineMembers});
    })
}