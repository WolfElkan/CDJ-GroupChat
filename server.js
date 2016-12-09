var express = require('express');
var path = require('path');
var BodyParser = require('body-parser')
var app = express();
app.use(express.static(path.join(__dirname,'./static')));
app.use(BodyParser.urlencoded({extended:true}));
app.set('views',path.join(__dirname,'./views'));
app.set('view engine','ejs');

app.get('/',function(request,response){
	response.render('index')
})

function Message (author,content,id) {
	this.author = author; // pointer to User object
	this.content = content;
	this.time = new Date();
}

function User (name,socket_id) {
	this.name = name;
	this.socket = socket_id;
	this.sock_ser = socket_id.slice(-4);
	this.join_time = new Date();
	this.left_time = null;
}

function sanitize(str){
	var res = '';
	for (var i = 0; i < str.length; i++) {
		if (str[i] == '<'){
			res += '&lt;';
		} else if (str[i] == '>') {
			res += '&gt;';
		} else {
			res += str[i];
		}
	}
	return res;
}

var port = 5000;
server = app.listen(port, function(){
	console.log('Running at LOCALHOST Port',port)
})

var USERS = {};
var MESSAGES = [];

var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket) {
	console.log('New connection socket:',socket.id);

	socket.on('new_user_joins',function(idata){
		idata = sanitize(idata);
		// Add user to USERS log
		var new_user = new User(idata,socket.id)
		USERS[socket.id] = new_user;
		// Notify other users
		var join_record = new Message(new_user,true,0);
		socket.broadcast.emit('message',join_record)
		// Welcome new user and send MESSAGES log
		socket.emit('welcome',{'history':MESSAGES,'whoami':new_user})
		// Add join record to MESSAGES log
		MESSAGES.push(join_record);
		// Print event to console.
		console.log(new_user.name,'entered chat.')
	})

	socket.on('message',function(data){
		// Add message details to MESSAGES log
		var author = USERS[socket.id];
		var new_Message = new Message(author,sanitize(data.content),data.id);
		MESSAGES.push(new_Message);
		// Send message to other users
		socket.broadcast.emit('message',new_Message);
		// Confirm reciept of message to sender
		socket.emit('success',data.id);
		// Print message to console
		console.log(`${author.name}:`,data.content);
	})

	socket.on('hack',function(){
		socket.emit('crack',{'Users':USERS, 'Messages':MESSAGES})
	})

})















