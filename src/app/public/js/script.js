//localStorage.debug = '*';
var socket = null;
var focused = true;
var unread = 0;
var emotecheck = null;
$('document').ready(function () {
socket = io.connect(window.location.href.slice(0, -1),
 {
    secure: true,
    transports: ['websocket'],
    reconnect: true,
    query: "token=" + getCookie("access_token"),
   });
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
        socket.emit('chat_message', {'user': u, 'message':m.val(), "token": getCookie("access_token")});
        m.val('');
    }
    else {
        alert('Username may not be empty!');
        document.getElementById('user_name').focus();
    }
  return false;
});

socket.on('error', function (msg) {
    showError(msg['message']);
});

socket.on('connect', function () {
    changeOnlineStatus(true);
});
socket.on('connect_error', (error) => {
    showError("Connection failed.");
    changeOnlineStatus(false);
    setTimeout(function () {
        socket.connect();
    }, 3000);
});
socket.on('connect_timeout', (timeout) => {
    changeOnlineStatus(false);
    setTimeout(function () {
        socket.connect();
    }, 3000);
});
socket.on('disconnect', (reason) => {
    showError("Disconnected.");
    changeOnlineStatus(false);
    if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        setTimeout(function () {
            socket.connect();
        }, 3000);
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
    if (checkOverflow(document.querySelector('#messages'))) { //check if chat would overflow currentSize and refresh scrollbar
        $('.nano').nanoScroller();
        chatdiv = document.querySelector('#messages');
        chatdiv.scrollTop = chatdiv.scrollHeight;
    }
    if (msg['user'] !== "Server" && !focused) {     //if user is not server and chat is not focused, increase unread message count in the tab menu
        unread++;
        document.title = "Socket.IO chat" + " (" + unread + ")";
        if (checkPermission()) {
            if (unread === 1) {
                newNotification(unread + " unread message!");
            } else if (unread % 5 === 0) {
                newNotification(unread + " unread messages!");
            }
        }
    }
    //if number of messages > 100 remove first message
    if ($('#messages > div').length > 100) {
        $('#messages').children().first().remove();
    }
    $('.chat').animate({scrollTop: $('.chat').prop("scrollHeight")}, 0);
});
//show usercount in navbar
socket.on('status', function(status) {
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

function showError(message) {
    document.getElementById("errorbox").innerText = message;
    $("#errorbox").fadeIn("slow");
    setTimeout(function() {
        hideError();
    }, 2000);
}

function changeOnlineStatus(online) {
    if (online) {
        document.getElementById("online-status").innerHTML =
            "<span class=\"badge badge-pill badge-success\">Connected</span>"
    } else {
        document.getElementById("online-status").innerHTML =
            "<span class=\"badge badge-pill badge-danger\">Disconnected</span>"
    }
}

function hideError() {
    $("#errorbox").fadeOut("slow");
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

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


function addEmoteCode(emote) {
    document.getElementById('m').value = document.getElementById('m').value + emote + " ";
    document.querySelector("#messages").focus();
}
setCheckInterval();