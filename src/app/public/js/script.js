//localStorage.debug = '*';
var socket = null;
var focused = true;
var unread = 0;
var emotecheck = null;
var emotelist = null;
var loginmode = true;
var ownusername = null;

var messages = [];
var message_pointer = 0;

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
            if($('#m').val().trim() == "" || $('#m').val() == messages[message_pointer]) {
                // up arrow
                message_pointer -= 1;
                if (message_pointer < 0) {
                    message_pointer = 0;
                }
                $('#m').val(messages[message_pointer]);
            }
        } else if (e.keyCode == '40') {
            if($('#m').val().trim() == "" || $('#m').val() == messages[message_pointer]) {
                // down arrow
                message_pointer += 1;
                if (message_pointer > messages.length - 1) {
                    message_pointer = messages.length - 1;
                }
                $('#m').val(messages[message_pointer]);
            }
        } else if (e.keyCode == '9') {
            e.preventDefault();
            tabComplete(document.getElementById('m').selectionStart);
        }
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey)
        {
            // prevent default behavior
            e.preventDefault();
            $('form').submit();
        }
    };

    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        let m = $('#m');
        if (loginmode == false) {
            let u = $('#user_name').val();
            ownusername = u.toLowerCase();
            if (u != '') {
                if (m.val() != "") {
                    messages.push(m.val());
                    message_pointer = messages.length;

                    socket.emit('chat_message', {
                        'display_name': u,
                        'message': m.val(),
                        'token': getCookie('access_token')
                    });
                    m.val('');
                } else {
                    showError('Invalid message.');
                }
            } else {
                showError('Username must be given.');
            }
        } else {
            if (m.val() != "") {
                messages.push(m.val());
                message_pointer = messages.length;
                let u = 'Shawn'; // username will be replaced with value from userconfig
                socket.emit('chat_message', {
                    'display_name': u,
                    'message': m.val(),
                    'token': getCookie('access_token')
                });
                m.val('');
            } else {
                showError('Invalid message.');
            }
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
        msgcontent = msg['message'];
        mentionIndex = msgcontent.toLowerCase().search('@' + ownusername);
        if (mentionIndex != -1) {
            replacement = '<em>@' + ownusername + '</em>';
            length = ownusername.length + 1;
            msgcontent = replaceSubStr(msgcontent, mentionIndex, replacement, length);
        }
        let item = $('<div class="message-container d-flex border-bottom pt-2 pb-2 px-2">');
        let content = $('<div>');    //div which contains header and message content
        let header = $('<h2 class="message-header d-inline-flex align-items-baseline mb-1">');      //div which contains username and timestamp
        header.append($('<div class="message-name">').prop('title', msg['username']).text(msg['display_name']).css('color', msg['user_color']));   //append username and timestamp as title to header-div
        header.append($('<time class="message-timestamp ml-1">').text(msg['timestamp']));                  //append timestamp to header-div
        content.append(header);                                                                               //append header to message-container-div
        content.append($('<div class="message-content">').html(msgcontent));                              //append message content to message-container-div
        item.append($('<img class="message-profile-image mr-3 rounded-circle" src="' + msg['avatar'] + '">'))                //prepend profile picture to message-container-div
        item.append(content);
        $('#messages').append(item);    //append message to chat-div
        if (checkOverflow(document.querySelector('#messages'))) { //check if chat would overflow currentSize and refresh scrollbar
            $('.nano').nanoScroller();
            chatdiv = document.querySelector('#messages');
            chatdiv.scrollTop = chatdiv.scrollHeight;
        }
        if (msg['display_name'] !== "Server" && !focused) {     //if user is not server and chat is not focused, increase unread message count in the tab menu
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
// show usercount in navbar
// enable/disable username
    socket.on('status', function (status) {
        if (status.hasOwnProperty('count')) {
            setUserCount(status['count']);
        }
        if (status.hasOwnProperty('newemote')) {

        }
        if (status.hasOwnProperty('loginmode')) {
            if (status['loginmode']) {
                document.getElementById('username-item').style.display = 'none';
                loginmode = true;
                if (status.hasOwnProperty('username')) {
                    ownusername = status['username'].toLowerCase();
                }
            } else {
                document.getElementById('username-item').style.display = 'block';
                loginmode = false;
            }
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

function addEmoteCode(emote) {
    $('#m').val($('#m').val() + " " + emote + " ");
    toggleEmoteMenu();
    $("#m").focus();
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


function addEmoteCode(emote) {
    document.getElementById('m').value = document.getElementById('m').value + " " + emote + " ";
    toggleEmoteMenu();
    document.querySelector('#messages').focus();
    document.querySelector('#m').focus();
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
    let messageSplit = m.value.substring(0, CursorPos);
    let lastSplit = messageSplit.lastIndexOf(' ') + 1
    let toComplete = messageSplit.substring(lastSplit);

    for (let emote in emotelist) {
        if (emote.toLowerCase().startsWith(toComplete.toLowerCase())) {
            console.log(emote);
            let mIn = m.value.substr(0, lastSplit) + emote + " ";
            m.value = mIn + m.value.substr(CursorPos + 1);
            m.setSelectionRange(mIn.length, mIn.length);
            break;
        }
    }
}

function replaceSubStr(text, index, replacement, length) {
    return text.substr(0, index) + replacement + text.substr(index + length);
}