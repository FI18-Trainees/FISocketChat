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
		let m = $('#m');
		if(u != "")
		{
			socket.emit('chat_message', {'user': u, 'message':m.val()});
			m.val('');
		}
		else {
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
	});
    socket.on('chat_message', function(msg){
        let item = $('<div class="message-container">');
        let header = $('<h2 class="message-header">');
        header.append($('<div class="message-name">').prop('title', msg['timestamp']).text(msg['user']));
        header.append($('<time class="message-timestamp">').text(msg['timestamp']));
        item.append(header);
        item.append($('<div class="message-content">').html(msg['message']));
		$('#messages').append(item);
	  if(msg['user'] !== "Server" && !focused) {
		unread++;
		document.title = "Socket.IO chat" + " (" + unread +")";
	  }
	  if($('#messages').children().length > 100) {
		$('#messages').find('#messages:first-child').remove();
	  }

	  $('.chat').animate({scrollTop: $('.chat').prop("scrollHeight")}, 0);
    });
    socket.on('status', function(status) {
        if(status.hasOwnProperty('count'))
        {
            $('#usercount').text('Usercount: ' + status['count']);
        }
    });
  });
  
  function addEmoteCode(emote)
  {
	  document.getElementById('m').value = document.getElementById('m').value + emote + " ";
	  $("#m").focus();
  }
  
