$(function () {
    var socket = io();
	var focused = true;
	var unread = 0;

	window.onfocus = function() {
	document.title = "Socket.IO chat";
	unread = 0;
		focused = true;
	};
	window.onblur = function() {
		focused = false;
	};
	
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
		let u = $('#user_name').val();
		let nt = $('#nt').val();
		if(u != "" && nt != "")
		{
			socket.emit('chat_message',nt + ";" + u + ": " + $('#m').val());
			$('#m').val('');
		}
		else
		{
			alert('Username may not be empty!');
		}
      return false;
    });
	socket.on('connect_error', (error)=> {
		socket.connect();
	});
	socket.on('connect_timeout', (timeout) => {
		socket.connect();
	});
	socket.on('disconnect', (reason) => {
	if (reason === 'io server disconnect') {
		// the disconnection was initiated by the server, you need to reconnect manually
		socket.connect();
	}
	// else the socket will automatically try to reconnect
	});
    socket.on('chat_message', function(msg){
		console.log(msg);
		var message = msg.substr(msg.indexOf(";")+1);
		var user = msg.substr(0,msg.indexOf(";"));
		$('#messages').append($('<li>').html(message).prop('title', user));    
	  if(!msg.startsWith("Server") && !focused)
	  {
		unread++;
		document.title = "Socket.IO chat" + " (" + unread +")";
	  }
	  if($('#messages').children().length > 100)
	  {
		$('#messages').find('li:first-child').remove();
	  }

	  $('.chat').animate({scrollTop: $('.chat').prop("scrollHeight")}, 0);
    });
  });