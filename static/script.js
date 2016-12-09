var socket = io.connect();

function hack() {
	socket.emit('hack');
}

socket.on('crack',function(data){
	console.log(data);
})

function disp_message(msg) {
	if (typeof(msg.content) == 'boolean') {
		if (msg.content) {
			var text = msg.author.name + ' joined the conversation.'
		} else {
			var text = msg.author.name + ' left the conversation.'
		}
		var html = `<div class="action">
					<div>`+text+`</div>
					</div>`
	} else if (msg.time == null) {
				`<div class="pending">
					<div class="user_name">${msg.author.name}:</div>
					<div class="message_body">$msg.content</div>
				</div>`
	} else {
		var text = msg.content;
		var author = msg.author;
		var html = `<div class="message">
					<div class="user_name">`+author.name+`:</div>
					<div class="message_body">`+text+`</div>
					</div>`
	}
	return html;
}

function refresh(history) {
	var html = '';
	for (var m in history){
		html += disp_message(history[m]);
	}
	$('#conversation').html(html);
}

var me = {};
var message_id = 1;
var history = [];

$(document).ready(function(){
	
	$('#register').submit(function(){
		// Send name and join request to server
		var data = $('#user').val();
		socket.emit('new_user_joins',data);
		// Display message while waiting for response
		$('#reg_instruction').html('Loggin in, please wait...');
		return false;
	})

	socket.on('welcome', function(data){
		// Hide registration window and show chat window
		$('#reg_window').addClass('hidden');
		$('#reg_window').removeClass('visible');
		$('#chat_window').removeClass('hidden');
		me = data.whoami;
		// Populate conversation history
		refresh(data.history);
	})

	$('#new_message').submit(function(){
		var message = $('#compose').val();
		// Add message to message window (in gray)
		$('#conversation').append(`
			<div id="mid${message_id}" class="pending">
				<div class="user_name">${me.name}:</div>
				<div class="message_body">${message}</div>
			</div>`)
		$('#compose').val('');
		// Send message to server
		socket.emit('message',{'content':message,'id':message_id++})
		return false;
	})

	socket.on('success', function(data){
		// Turn message black
		$(`#mid${data}`).removeClass('pending');
		$(`#mid${data}`).addClass('message')
	})

	socket.on('message', function(data){
		// Add message to window
		$('#conversation').append(disp_message(data))
		
	})

})