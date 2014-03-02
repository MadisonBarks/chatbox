/**
 * Created by austin on 2/28/14.
 */
var socket = io.connect('http://chatbox.fullhousedev.com:4000');
socket.on("chatmessage", function (user, msg) {
	console.log("Chat message from user " + user + " saying " + msg);
    $('#messages').append(user + ": " + msg);
});
socket.on("userdisconnect", function (user) {
	console.log("User disconnected: " + user);
    $("li:contains(" + user + ")").remove();
});
socket.on("userconnect", function (user) {
	console.log("User connected: " + user);
    $("#allusers").append("<li>" + user + "</li>");
});
$(document).ready(function () {
    $('#send').click(function () {
        var msg = $('#message_box').val();
        $('#message_box').val("");
        $('#messages').append("Me: " + msg);
        socket.emit("chatmessage", msg);
    });
});
