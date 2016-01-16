var io;

var userInfo = {};

module.exports = function (app,session){
    var sharedSession = require("express-socket.io-session");
    var http = require("http").Server(app);
    io = require("socket.io")(http);
    //starting io
    io.use(sharedSession(session));
    
    io.on("connection", function (socket){
	console.log("new connection");
	console.log(socket.handshake.session.user);
	//handling join
	socket.on("join",function(req){
	    if(typeof(userInfo[socket.handshake.session.user.userName]) != "undefined"){
		socket.leave(userInfo[socket.handshake.session.user.userName]);
		delete userInfo[socket.handshake.session.user.userName];
	    }
	    socket.join(req.room);
	    userInfo[socket.handshake.session.user.userName] = req.room;
	    console.log(userInfo[socket.handshake.session.user.userName]);
	});
	socket.on("message",function(message){
	    message.who = socket.handshake.session.user.userName;
	    console.log(message);
	    io.emit("hello");
	    //console.log(userInfo[socket.handshake.user.userName]);
	    io.to(userInfo[socket.handshake.session.user.userName]).emit("message",message);
	});
	
    });
    http.listen(80, function(){
	console.log("server started");
    });
};
