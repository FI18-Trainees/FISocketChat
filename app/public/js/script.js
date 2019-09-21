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
		if(u !== "") {
			socket.emit('chat_message', {'user': u, 'message': $('#m').val() });
			$('#m').val('');
		}
		else {
            alert('Username may not be empty!');
            document.getElementById('user_name').focus();
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
    //build html-div which will be shown
    socket.on('chat_message', function (msg) {
        let item = $('<div class="message-container">');    //div which contains the message
        let header = $('<h2 class="message-header">');      //div which contains username and timestamp
        header.append($('<div class="message-name">').prop('title', msg['timestamp']).text(msg['user']));   //append username and timestamp as title to header-div
        header.append($('<time class="message-timestamp">').text(msg['timestamp']));                        //append timestamp to header-div
        item.append(header);                                                                                //append header to message-container-div
        item.append($('<div class="message-content">').html(msg['message']));                               //append message content to message-container-div
		$('#messages').append(item);    //append message to chat-div
        if (msg['user'] !== "Server" && !focused) {     //if user is not server and chat is not focused, increase unread message count in the tab menu
            unread++;
            document.title = "Socket.IO chat" + " (" + unread + ")";
        }
      //if number of messages > 100 remove first message
	  if($('#messages > div').length > 100) {
        $('#messages').children().first().remove();
	  }
	  $('.chat').animate({scrollTop: $('.chat').prop("scrollHeight")}, 0);
    });
    //show usercount in navbar
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
  