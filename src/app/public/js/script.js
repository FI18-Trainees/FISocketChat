//localStorage.debug = '*';
var socket = null;
var focused = true;
var unread = 0;
var emotecheck = null;
var emotelist = null;
var loginmode = true;
var cooldown = 0;
var ownusername = null;

var message_history = [];
var history_pointer = 0;

$('document').ready(function () {
    socket = io.connect(window.location.href.slice(0, -1),
        {
            secure: true,
            transports: ['polling', 'websocket'],
            reconnect: true,
            query: "token=" + getCookie("access_token"),
        });
    window.onfocus = function () {
        document.title = "Socket.IO chat";
        unread = 0;
        focused = true;
        if (!socket.connected) {
            setUserCount("offline");
            socket.connect();
        }
        closeAllNotifications();
    };
    window.onblur = function () {
        focused = false;
    };

    document.getElementById("m").onkeydown = function (e) {
        e = e || window.event;
        if (e.keyCode == '38') {
            if ($('#m').val().trim() == "" || $('#m').val() == message_history[history_pointer]) {
                // up arrow
                history_pointer -= 1;
                if (history_pointer < 0) {
                    history_pointer = 0;
                }
                $('#m').val(message_history[history_pointer]);
            }
        } else if (e.keyCode == '40') {
            if ($('#m').val().trim() == "" || $('#m').val() == message_history[history_pointer]) {
                // down arrow
                history_pointer += 1;
                if (history_pointer > message_history.length - 1) {
                    history_pointer = message_history.length - 1;
                }
                $('#m').val(message_history[history_pointer]);
            }
        } else if (e.keyCode == '9') {
                //tab key
            e.preventDefault();
            tabComplete(document.getElementById('m').selectionStart);
        }
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey) {
            // prevent default behavior
            e.preventDefault();
            $('form').submit();
        }
    };

    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        if (cooldown !== 0) {
            showError("Sending messages to fast!");
            return;
        }
        cooldown = window.setTimeout(function () {
            cooldown = 0
        }, 400);

        let m = $('#m');
        if (m.val().trim() == "") {
            showError('Invalid message.');
            return false;
        }

        message_history.push(m.val());
        history_pointer = message_history.length;
        let u = $('#user_name').val();

        let event_name = "chat_message";
        if (m.val().startsWith("/")) {
            event_name = "chat_command";
        }

        if (!loginmode) {
            if (u.trim() === '') {
                showError('Username must be given.');
                return false;
            } else {
                ownusername = u.toLowerCase();
            }
        } else {
            u = 'Shawn'; // username will be replaced with value from userconfig
        }

        socket.emit(event_name, {
            'display_name': u,
            'message': m.val(),
            'token': getCookie('access_token')
        });
        m.val('');
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
        console.log(error);
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
        disconnectNotification();
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
        let msgcontent = msg['message'];
        let username = msg['username'];
        let display_name = msg['display_name'];
        let user_color = msg['user_color'];
        let user_avatar = msg['avatar'];
        let timestamp = msg['timestamp'];
        let last_message = document.getElementById('messages')

        mentionIndex = msgcontent.toLowerCase().search('@' + ownusername);
        if (msgcontent.toLowerCase().search('@' + ownusername) != -1) {
            msgcontent = makeMention(msgcontent);
            if (checkPermission()) {
                newNotification("You have been mentioned");
            }
        }

        // check if username of last message is identical to new message
        if($('#messages :last-child div h2 div').prop('title') == username) {
            $('#messages :last-child .message-content').last().append($('<div class="message-content w-100">').html(msgcontent));
            $('#messages .message-header').last().children('time').text(timestamp);
        } else {
            let item = $('<div class="message-container d-flex border-bottom pt-2 pb-2 px-2">');
            let content = $('<div>');    //div which contains header and message content
            let header = $('<h2 class="message-header d-inline-flex align-items-baseline mb-1">');      //div which contains username and timestamp
            header.append($('<div class="message-name">').prop('title', username).text(display_name).css('color', user_color).click(uname_name_click));   //append username and timestamp as title to header-div
            header.append($('<time class="message-timestamp ml-1">').text(timestamp));                  //append timestamp to header-div
            content.append(header);                                                                               //append header to message-container-div
            content.append($('<div class="message-content w-100">').html(msgcontent));                              //append message content to message-container-div
            item.append($('<img class="message-profile-image mr-3 rounded-circle" src="' + user_avatar + '">'))                //prepend profile picture to message-container-div
            item.append(content);
            $('#messages').append(item);    //append message to chat-div
        }
        if (checkOverflow(document.querySelector('#messages'))) { //check if chat would overflow currentSize and refresh scrollbar
            $('.nano').nanoScroller();
            chatdiv = document.querySelector('#messages');
            chatdiv.scrollTop = chatdiv.scrollHeight;
        }
        if (!focused) {
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
    socket.on('status', function (status) {
        if (status.hasOwnProperty('count')) {
            setUserCount(status['count']);
        }
        if (status.hasOwnProperty('newemote')) {

        }
        if (status.hasOwnProperty('username')) {
            ownusername = status['username'].toLowerCase();
        }
        if (status.hasOwnProperty('loginmode')) {
            if (status['loginmode']) {
                document.getElementById('username-item').style.display = 'none';
                loginmode = true;
            } else {
                document.getElementById('username-item').style.display = 'block';
                document.getElementById('user_name').value = 'DebugUser';
                loginmode = false;
            }
        }
    });

    $(document).on('keydown', function (event) {
        if (event.keyCode === 17) {
            $('.message-name').css('cursor', 'pointer');
        }
    });
    $(document).on('keyup', function (event) {
        if (event.keyCode === 17) {
            $('.message-name').css('cursor', 'default');
        }
    });


});

function setUserCount(count) {
    $('#usercount').text('Usercount: ' + count);
}

function showError(message) {
    document.getElementById("errorbox").innerText = message;
    $("#errorbox").fadeIn("slow");
    setTimeout(function () {
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
    $('#m').val($('#m').val() + " " + emote + " ");
    toggleEmoteMenu();
    $("#m").focus();
}

function updateEmoteMenu() {
    // retrieving the emotes as JSON from the API
    $.getJSON('/api/emotes', function (result) {
        // checking if the JSON even contains emotes.
        if (Object.keys(result).length > 0) {
            if (JSON.stringify(emotelist) === JSON.stringify(result)) {
                return;
            }
            emotelist = result
            // getting the emote menu
            let menu = $('#emoteMenu');
            // clearing the emote menu
            menu.empty();
            // iterate over the emotes from the JSON
            for (let emote in result) {
                // jumping over the hidden ones.
                if (result[emote]["menuDisplay"]) {
                    emoteitem = document.createElement('a');
                    emoteitem.href = "#";
                    emoteitem.innerHTML = result[emote]["menuDisplayCode"];
                    emoteitem.onclick = function () {
                        addEmoteCode(emote);
                    };
                    emoteMenu.append(emoteitem);
                    emoteMenu.append(document.createElement('wbr'));
                }
            }
        }
    });
}

function setCheckInterval() {
    emotecheck = setInterval(updateEmoteMenu, 60 * 60 * 1000);
}

function setup() {
    updateEmoteMenu();
    document.getElementById("emotebtn").addEventListener('click', toggleEmoteMenu);
    //document.getElementById("navbar").addEventListener('resize', resizeNavbar);
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function toggleEmoteMenu() {
    var object = document.getElementById("emoteMenu");
    if (object.style.display == "none" || object.style.display == "") {
        object.style.display = "block";
    } else {
        object.style.display = "none";
    }
}

function tabComplete(CursorPos) {
    // emote Only right now
    let m = document.getElementById('m');
    if (m.value.length == 0)
        return;
    let messageSplit = m.value.substring(0, CursorPos);
    let matches = Array.from(messageSplit.matchAll(/[\r\n\t ]/gm));
    let lastSplit = 0;
    if (matches.length > 0) {
        lastSplit = matches[matches.length - 1].index + 1;
    }
    let toComplete = messageSplit.substring(lastSplit);
    if (toComplete.length < 1)
        return;
    for (let emote in emotelist) {
        if (emote.toLowerCase().startsWith(toComplete.toLowerCase())) {
            let mIn = m.value.substr(0, lastSplit) + emote + " ";
            m.value = mIn + m.value.substr(CursorPos + 1);
            m.setSelectionRange(mIn.length, mIn.length);
            break;
        }
    }
}

function makeMention(text) {
    return '<em class="d-inline-flex w-100">' + text + '</em>';
}

function uname_name_click(e){
    if(e.originalEvent.ctrlKey){
        e.preventDefault();
        document.getElementById('m').value += '@' + e.target.title + ' ';
    }
}