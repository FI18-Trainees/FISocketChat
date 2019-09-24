//localStorage.debug = '*';
    var socket = null;
	var focused = true;
	var unread = 0;
    var emotecheck = null;
$(document).ready(function () {
    socket = io.connect(window.location.href.slice(0, -1), {secure: true, transports: ['websocket']});
	window.onfocus = function() {
	    document.title = "Socket.IO chat";
	    unread = 0;
		focused = true;
		if(!socket.connected) {
		    setUserCount("offline");
		    socket.connect();
		}
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
            document.getElementById('user_name').focus();
		}
      return false;
    });
	socket.on('connect_error', (error)=> {
	    setUserCount("offline, error");
		setTimeout(function() { socket.connect(); }, 3000);
	});
	socket.on('connect_timeout', (timeout) => {
	    setUserCount("offline, timeout");
		setTimeout(function() { socket.connect(); }, 3000);
	});
	socket.on('disconnect', (reason) => {
	if (reason === 'io server disconnect') {
		// the disconnection was initiated by the server, you need to reconnect manually
        setUserCount("offline");
		setTimeout(function() { socket.connect(); }, 3000);
	}
    });
    //build html-div which will be shown
    socket.on('chat_message', function (msg) {
        let item = $('<div class="message-container border-bottom pt-1 pb-2 px-2">');    //div which contains the message
        let header = $('<h2 class="message-header d-inline-flex align-items-baseline">');      //div which contains username and timestamp
        header.append($('<div class="message-name text-danger">').prop('title', msg['timestamp']).text(msg['user']));   //append username and timestamp as title to header-div
        header.append($('<time class="message-timestamp ml-1">').text(msg['timestamp']));                        //append timestamp to header-div
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
    console.log(status);
        if(status.hasOwnProperty('count')) {
            setUserCount(status['count']);
        }
        if(status.hasOwnProperty('newemote')) {

        }
    });
  });

  function setUserCount(count) {
    $('#usercount').text('Usercount: ' + count);
  }

  function addEmoteCode(emote) {
	  $('#m').val($('#m').val() + emote + " " );
	  $("#m").focus();
  }
  function checkForNewEmote() {
    socket.emit('checkNewEmote');
  }
  function updateEmoteMenu() {
   // TODO
  }
  function setCheckInterval() {
    emotecheck = setInterval(checkForNewEmote, 300000);
  }


  setCheckInterval();