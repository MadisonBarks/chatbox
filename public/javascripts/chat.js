/**
 * Created by austin on 2/28/14.
 */
var socket = io.connect('http://localhost:8081');
socket.on("chatmessage", function (user, msg) {
    $('#messages').append(user + ": " + msg);
});
socket.on("userdisconnect", function (user) {
    $("li:contains(" + user + ")").remove();
});
socket.on("userconnect", function (user) {
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
