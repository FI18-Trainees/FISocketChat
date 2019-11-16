//localStorage.debug = '*';
var socket = null;
var focused = true;
var unread = 0;
var emotelist = null;
var loginmode = true;
var cooldown = 0;
var ownusername = null;
var userlist = [];
var notificationmode = 0;
var autoscroll = true;
var lastScrollDirection = 0; // 1 is down; 0 is none; -1 is up

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
        let m = $('#m');
        e = e || window.event;
        if (e.keyCode == '38') {
            if (m.val().trim() == "" || m.val() == message_history[history_pointer]) {
                // up arrow
                history_pointer -= 1;
                if (history_pointer < 0) {
                    history_pointer = 0;
                }
                m.val(message_history[history_pointer]);
            }
        } else if (e.keyCode == '40') {
            if (m.val().trim() == "" || m.val() == message_history[history_pointer]) {
                // down arrow
                history_pointer += 1;
                if (history_pointer > message_history.length - 1) {
                    history_pointer = message_history.length - 1;
                }
                m.val(message_history[history_pointer]);
            }
        } else if (e.keyCode == '9') {
                //tab key
            e.preventDefault();
            if(e.shiftKey) {
                document.getElementById('m').value += "\t";
            }
            else {
                tabComplete(document.getElementById('m').selectionStart);
            }

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
        console.log(timeout);
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
        let content = msg['msg_body'];
        let username = msg['author']['username'];
        let timestamp = msg['timestamp'];

        let mentioned = (content.toLowerCase().search('@' + ownusername) != -1) || (content.toLowerCase().search('@everyone') != -1);
        if (mentioned) {
            msg['msg_body'] = makeMention(content);
            if (checkPermission() && notificationmode != 0) {
                newNotification("You have been mentioned!");
            }
        }

        // check if username of last message is identical to new message
        if($('#messages :last-child div h2 div').prop('title') == username) {
            appendMessage(content, timestamp);
        } else {
            addMessage(msg);
        }
        //check if chat would overflow currentSize and refresh scrollbar
        if (checkOverflow(document.querySelector('#messages'))) { 
            $('.nano').nanoScroller();
            if(autoscroll) {
                chatdiv = document.querySelector('#messages');
                chatdiv.scrollTop = chatdiv.scrollHeight;
            }
        }
        if (!focused) {
            unread++;
            document.title = "Socket.IO chat" + " (" + unread + ")";
            if (checkPermission() && notificationmode == 2) {
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

    $('#notification-mode').change(function () {
        notificationmode = this.value;
    });
    updateEmoteMenu();
    document.getElementById("emotebtn").addEventListener('click', toggleEmoteMenu);

    mobileAndTabletcheck();
    displayNotifyMode();
});

function addMessage(msg) {
    let message_container, message_header, message_body, message_thumbnail, message_username, message_timestamp, message_content;

    let content = msg['msg_body'];
    let username = msg['author']['username'];
    let display_name = msg['author']['display_name'];
    let user_color = msg['author']['chat_color'];
    let user_avatar = msg['author']['avatar'];
    let timestamp = msg['timestamp'];

    message_container = $('<div class="message-container d-flex border-bottom p-2">');
    message_header = $('<h2 class="message-header d-inline-flex align-items-baseline mb-1">');
    message_body = $('<div class="message-body w-100">');
    message_thumbnail = $('<img class="message-profile-image mr-3 rounded-circle" src="' + user_avatar + '">');
    message_username = $('<div class="message-name">').prop('title', username).text(display_name).css('color', user_color).click(uname_name_click);
    message_timestamp = $('<time class="message-timestamp ml-1">').text(timestamp);
    message_content = $('<div class="message-content text-white w-100 pb-1">').html(content);

    message_container.append(message_thumbnail, message_header, message_body);
    message_header.append(message_username, message_timestamp);
    message_body.append(message_content);
    $('#messages').append(message_container);
}

function appendMessage(content, timestamp) {
    $('#messages .message-container').last().children().append($('<div class="message-content text-white w-100 pb-1">').html(content));
    $('#messages .message-header').last().children('time').text(timestamp);
}

function setUserCount(count) {
    $('#usercount').text('Usercount: ' + count);
    $.ajax({
        url: "api/user",
    }).done(function(data) {
        userlist = data;
        userlist.push('everyone');
    });
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
    if (toComplete.toLowerCase().startsWith("@") && toComplete.length > 1) {
        for (username of userlist.entries()) {
            if (username[1] !== null && username[1].toLowerCase().startsWith(toComplete.substring(1).toLowerCase())) {
                let mIn = m.value.substr(0, lastSplit) + "@" + username[1] + " ";
                m.value = mIn + m.value.substr(CursorPos + 1);
                m.setSelectionRange(mIn.length, mIn.length);
                return;
            }
        }
    }
    else {
        for (let emote in emotelist) {
            if (emote.toLowerCase().startsWith(toComplete.toLowerCase())) {
                let mIn = m.value.substr(0, lastSplit) + emote + " ";
                m.value = mIn + m.value.substr(CursorPos + 1);
                m.setSelectionRange(mIn.length, mIn.length);
                break;
            }
        }
    }
}

function makeMention(text) {
    return '<em class="d-flex w-100 mention">' + text + '</em>';
}

function uname_name_click(e){
    if(e.originalEvent.ctrlKey){
        e.preventDefault();
        document.getElementById('m').value += '@' + e.target.title + ' ';
    }
}

function setautoscroll(value) {
    autoscroll = value;
    document.getElementById('autoscroll').checked = value;
}

function messagesScroll(event) {
    if(event.deltaY>0) { //Down
        if(lastScrollDirection === 1) {
        let messagediv = document.getElementById('messages');
            if(messagediv.scrollTop === (messagediv.scrollHeight - messagediv.offsetHeight)) {
                setautoscroll(true);
                lastScrollDirection = 0;
            }
        }
        else {
            lastScrollDirection = 1;
        }
    }
    else { //Up
        if(lastScrollDirection === -1) {
            setautoscroll(false);
            lastScrollDirection = 0;
        }
        else {
            lastScrollDirection = -1;
        }
    }
}

function mobileAndTabletcheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    if(check) {
        $('#sendbtn').css('display', 'block');
    } else {
        $('#sendbtn').css('display', 'none');
    }
}

function imgloaded() {
    if (checkOverflow(document.querySelector('#messages'))) { //check if chat would overflow currentSize and refresh scrollbar
        $('.nano').nanoScroller();
        if(autoscroll) {
            chatdiv = document.querySelector('#messages');
            chatdiv.scrollTop = chatdiv.scrollHeight;
        }
    }
}
