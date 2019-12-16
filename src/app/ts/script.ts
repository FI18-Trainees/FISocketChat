import * as io from "socket.io-client";
import { IMessage } from "./IMessage";
import { IEmbed } from "./IEmbed";
import { IMedia } from "./IMedia";
import { IFields } from "./IFields";
//TODO import nanoScroller

//localStorage.debug = '*';

var socket: SocketIO.Socket;
var focused = true;
var unread = 0;
var emotelist: JSON;
var emotekeylist: string[];
var commandlist: string[];
var loginmode = true;
var cooldown = 0;
var ownusername: string;
var userlist: string[] = [];
var notificationmode = 'no';
var autoscroll = true;
var lastScrollDirection = 0; // 1 is down; 0 is none; -1 is up

var message_history: string[] = [];
var history_pointer = 0;

var imagecache;

const messagefield: JQuery<HTMLInputElement> = $('#messageinput');
const infobox = $('#infobox');
const errorbox = $('#errorbox');

$('document').ready(function () {

    let socket = io.connect(window.location.href.slice(0, -1),
        {
            secure: true,
            transports: ['polling', 'websocket'],
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


    messagefield.keydown(function (e) {
        switch (e.keyCode) {
            case 9:
                //tab key
                e.preventDefault();
                if (e.shiftKey) {
                    messagefield.val(messagefield.val() + "\t");
                }
                else {
                    tabComplete(messagefield.prop('selectionStart'));
                }
                break;
            case 13:
                if (e.keyCode ===  13 && !e.shiftKey) {
                    // Enter was pressed without shift key
                    // prevent default behavior
                    e.preventDefault();
                    $('form').submit();
                }
                break;
            case 38:
                //up arrow
                if (messagefield.val() === "" || messagefield.val() === message_history[history_pointer]) {
                    history_pointer -= 1;
                    if (history_pointer < 0) {
                        history_pointer = 0;
                    }
                    messagefield.val(message_history[history_pointer]);
                }
                break;
            case 40:
                // down arrow
                if ((<string>messagefield.val()).trim() === "" || messagefield.val() === message_history[history_pointer]) {
                    history_pointer += 1;
                    if (history_pointer > message_history.length - 1) {
                        history_pointer = message_history.length - 1;
                    }
                    messagefield.val(message_history[history_pointer]);
                }
                break;
        }
    });

    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        if (cooldown !== 0) {
            showError("Sending messages to fast!");
            return;
        }
        cooldown = window.setTimeout(function () {
            cooldown = 0
        }, 400);
        if ((<string>messagefield.val()).trim() === "") {
            showError('Invalid message.');
            return false;
        }

        message_history.push(<string>messagefield.val());
        history_pointer = message_history.length;
        let u = <string>$('#user_name').val();

        let event_name = "chat_message";
        if ((<string>messagefield.val()).startsWith("/")) {
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
            u = 'Shawn'; // username will be replaced with value from userconfig, but must be given
        }

        socket.emit(event_name, {
            'display_name': u,
            'message': messagefield.val(),
            'token': getCookie('access_token')
        });
        messagefield.val('');
        return false;
    });

    socket.on('error', function (msg: {message: string}) {
        showError(msg['message']);
    });
    socket.on('connect', function () {
        changeOnlineStatus(true);
    });
    socket.on('connect_error', (error: string) => {
        showError("Connection failed.");
        console.log(error);
        changeOnlineStatus(false);
        reconnect();
    });
    socket.on('connect_timeout', (timeout: number) => {
        changeOnlineStatus(false);
        console.log(timeout);
        reconnect();
    });
    socket.on('disconnect', (reason: string) => {
        showError("Disconnected.");
        disconnectNotification();
        changeOnlineStatus(false);
        if (reason === 'io server disconnect') {
            // the disconnection was initiated by the server, you need to reconnect manually
            reconnect();
        }
    });
    socket.on('chat_message', function (msg: {content_type: string, content: string}) {
        switch (msg['content_type']) {
            case 'message':
                let content = msg['content'];
                let mentioned = (content.toLowerCase().search('@' + ownusername) !== -1) || (content.toLowerCase().search('@everyone') !== -1);
                if (mentioned) {
                    msg['content'] = makeMention(content);
                    if (checkPermission() && notificationmode !== 'no') {
                        newNotification("You have been mentioned!");
                    }
                }

                // check if username of last message is identical to new message
                newMessageHandler(msg);
                break;
            case 'embed':
                addEmbed(msg);
                break;
        }

        //check if chat would overflow currentSize and refresh scrollbar
        if (checkOverflow(<HTMLDivElement>document.getElementById('#messages'))) {
            //$('.nano').nanoScroller();
            if(autoscroll) {
                let chatdiv: HTMLDivElement = <HTMLDivElement>document.getElementById('messages');
                chatdiv.scrollTop = chatdiv.scrollHeight;
            }
            else {
                showInfo("There are new Messages below. Click here to scroll down.", 0, function(){ setautoscroll(true); hideInfo(); updateScroll()});
            }
        }
        if (!focused) {
            unread++;
            document.title = "Socket.IO chat" + " (" + unread + ")";
            if (checkPermission() && notificationmode === 'all') {
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
    socket.on('status', function (status: {count?: string, username?: string, loginmode?: string, chat_color?: string}) {
        if (status.hasOwnProperty('count')) {
            setUserCount(<string>status['count']);
        }
        if (status.hasOwnProperty('username')) {
            ownusername = (<string>status['username']).toLowerCase();
            $('#logininfo_name').text(`Logged in as ${status['username']}`).css('color', <string>status['chat_color']);
            $('#logininfo_picture').attr('src',`https://profile.zaanposni.com/pictures/${ownusername}.png`);
        }
        if (status.hasOwnProperty('loginmode')) {
            if (status['loginmode']) {
                $('#username-item').css('display', 'none');
                loginmode = true;
            } else {
                $('#username-item').css('display', 'block');
                $('#user_name').val('DebugUser');
                $('logininfo_sitebar').css('display', 'none');
                loginmode = false;
            }
        }
        if (status.hasOwnProperty('on_ready')) {
            updateEmoteMenu();
            (<HTMLButtonElement>document.getElementById("emotebtn")).addEventListener('click', toggleEmoteMenu);

            getCommands();

            mobileAndTabletcheck();
            displayNotifyMode();
            $('#notification-mode').val(<string>getCookie('notificationmode'));

            $('messageinput').on('paste', function(){handlePaste});

            getMessageHistory();
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
        notificationmode = (<string>(<JQuery<HTMLSelectElement>>$('#notification-mode')).val());
        document.cookie = `notificationmode=${notificationmode}; expires=Thu, 01 Jan 2023 00:00:00 UTC; path=/`;
    });
});

function reconnect() {
    setTimeout(function () {
        io.connect();
    }, 3000);
}

function newMessageHandler(msg: IMessage) {
    if($('#messages :last-child div h2 div').prop('title') === msg.author.username) {
        if (msg.append_allow) {
            appendMessage(msg);
            return
        }
    }
    addNewMessage(msg);
}

function addNewMessage(msg: IMessage) {
    let message_container, message_header, message_body, message_thumbnail, message_username, message_timestamp, message_content;

    message_container = $('<div class="message-container d-flex border-bottom p-2">');
    message_header = $('<h2 class="message-header d-inline-flex align-items-center mb-1">');
    message_body = $('<div class="message-body w-100">');
    message_thumbnail = $('<img class="message-profile-image mr-3 rounded-circle" src="' + msg.author.avatar + '">');
    message_username = $('<div class="message-name">').prop('title', msg.author.username).text(msg.author.display_name).css('color', msg.author.chat_color).click(uname_name_click);
    message_timestamp = $('<time class="message-timestamp ml-1">').prop('title', msg.timestamp.full_timestamp).text(msg.timestamp.timestamp);
    message_content = $('<div class="message-content text-white w-100 pb-1">').html(msg.content);

    message_container.append(message_thumbnail, message_body);
    message_body.append(message_header, message_content);
    message_header.append(message_username, message_timestamp);
    $('#messages').append(message_container);
}

function appendMessage(msg: IMessage) {
    $('#messages .message-container').last().children().append($('<div class="message-content text-white w-100 pb-1">').html(msg.content));
    $('#messages .message-header').last().children('time').text(msg.timestamp.timestamp);
}

function setUserCount(count: string) {
    $.ajax({
        url: "api/user",
    }).done(function(data) {
        $('#usercount').prop('title', data.join(', ')).text('Usercount: ' + count);
        userlist = data;
        userlist.push('everyone');
    });
}

function addEmbed(msg: IEmbed) {

    let embed_container = $('<div class="embed-container d-flex flex-column border-bottom px-3 my-3 w-75">');
    let embed_header = $('<div class="embed-header d-flex flex-wrap align-items-center mb-1">');

    let embed_author_thumbnail = $('<img class="embed-profile-image rounded-circle mr-2" src="' + msg.author.avatar + '">');
    let embed_author_name = $('<div class="embed-author-name">').prop('title', msg.author.username).text(msg.author.display_name).css('color', msg.author.chat_color).click(uname_name_click);
    let embed_title = $('<div class="embed-title py-2">').text(msg.title);

    let embed_footer_container = $('<div class="embed-footer-container d-inline-flex pb-1 mt-3">');
    let timestamp = new Date(msg.timestamp.full_timestamp);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric', second: 'numeric'};
    let embed_timestamp = $('<span class="embed-timestamp text-muted ml-auto">').text(timestamp.toLocaleDateString('de-DE', options));

    embed_container.append(embed_header);
    embed_container.append(embed_title);
    embed_header.append(embed_author_thumbnail);
    embed_header.append(embed_author_name);
    embed_footer_container.append(embed_timestamp);

    if(msg.hasOwnProperty('text')){
        $('<p class="embed-text">').html(<string>msg.text).insertAfter(embed_title);
    }
    if(msg.hasOwnProperty('fields')){
        let fields = msg.fields;
        let embed_field_container = $('<div class="embed-field-container d-flex flex-wrap justify-content-between py-3">');
        embed_container.append(embed_field_container);
        (<IFields[]>fields).forEach(item => {
            let embed_topic_container = $('<div class="embed-topic-container m-1">');
            let embed_topic = $('<p class="embed-topic">').text(item.topic);
            let embed_topic_value = $('<p class="embed-topic-value">').html(item.value);

            embed_field_container.append(embed_topic_container);
            embed_topic_container.append(embed_topic, embed_topic_value);
        });
    }

    if(msg.hasOwnProperty('media')){
        let embed_media_container = $('<div class="embed-media-container">');
        switch((<IMedia>msg.media).media_type) {
            case 'audio':
                let embed_audio: JQuery<HTMLAudioElement> = $('<audio class="audio-embed" controls preload="metadata"/>');
                embed_audio.attr('src', (<IMedia>msg.media).media_url) ;
                embed_media_container.append(embed_audio);
                break;
            case 'video':
                let embed_video: JQuery<HTMLVideoElement> = $('<video class="video-embed" controls preload="metadata"/>');
                embed_video.attr('src', (<IMedia>msg.media).media_url);
                //embed_video.addEventListener('loadedmetadata', updateScroll);
                embed_media_container.append(embed_video);
                break;
            case 'img':
                let embed_image = new Image();
                embed_image.src = (<IMedia>msg.media).media_url;
                embed_image.onload = function () {updateScroll();};
                embed_media_container.append(embed_image);
                break;
        }
        embed_container.append(embed_media_container);
    }
    if(msg.hasOwnProperty('footer')){
        let embed_footer = $('<span class="embed-footer">').text(<string>msg.footer);
        embed_footer_container.prepend(embed_footer);
    }
    if(msg.hasOwnProperty('color')){
        embed_container.css('border-left-color', <string>msg.color);
    }
    if(msg.hasOwnProperty('thumbnail')){
        let embed_thumbnail = new Image();
        embed_thumbnail.src = <string>msg.thumbnail;
        embed_thumbnail.onload = function () {updateScroll();};
        embed_thumbnail.classList.add('embed-thumbnail', 'ml-auto', 'mt-3');
        embed_header.append(embed_thumbnail);
    }

    embed_container.append(embed_footer_container);

    $('#messages').append(embed_container);
}

function showError(message: string) {
    errorbox.text(message);
    errorbox.fadeIn("slow");
    setTimeout(function () {
        hideError();
    }, 2000);
}

function showInfo(message: string, fadeoutdelay: number, onclick) {
    infobox.text(message);
    infobox.fadeIn("slow");
    if(onclick != null) {
        infobox.click(onclick);
    }
    if(fadeoutdelay > 0) {
        setTimeout(function () {
            hideInfo();
        }, fadeoutdelay);
    }
}

function changeOnlineStatus(online: boolean) {
    if (online) {
        $('#online-status').text('Connected').addClass('badge-success').removeClass('badge-danger');
    } else {
        $('#online-status').text('Disconnected').addClass('badge-danger').removeClass('badge-success');
    }
}

function hideError() {
    errorbox.fadeOut("slow");
}

function hideInfo() {
    infobox.fadeOut("slow");
    infobox.off('click');
}

function addEmoteCode(emote: string) {
    messagefield.val(messagefield.val() + " " + emote + " ");
    toggleEmoteMenu();
    messagefield.focus();
}

function updateEmoteMenu() {
    // retrieving the emotes as JSON from the API
    $.getJSON('/api/emotes', function (result) {
        // checking if the JSON even contains emotes.
        if (Object.keys(result).length > 0) {
            if (JSON.stringify(emotelist) === JSON.stringify(result)) {
                return;
            }
            emotelist = result;
            // getting the emote menu
            let emoteMenu = $('#emoteMenu');
            // clearing the emote menu
            emoteMenu.empty();
            // iterate over the emotes from the JSON
            for (let emote in result) {
                // jumping over the hidden ones.
                if (result[emote]["menuDisplay"]) {
                    let emoteitem = document.createElement('a');
                    emoteitem.classList.add('cursor-pointer');
                    emoteitem.innerHTML = result[emote]["menuDisplayCode"];
                    emoteitem.onclick = function () {
                        addEmoteCode(emote);
                    };
                    emoteMenu.append(emoteitem);
                    emoteMenu.append(document.createElement('wbr'));
                }
            }
            emotekeylist = Object.keys(emotelist);
            emotekeylist.sort(function (a, b) {
                let varA = a.toUpperCase();
                let varB = b.toUpperCase();
                if (varA < varB) {
                    return -1;
                }
                if (varA > varB) {
                    return 1;
                }
                return 0;
            });
        }
    });
}

function getCookie(name: string) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return (<string>parts.pop()).split(";").shift();
}

function toggleEmoteMenu() {
    let object = $('#emoteMenu');
    if (object.css('display') === 'none' || object.css('emoteMenu') === '') {
        object.css('display', 'block');
    } else {
        object.css('display', 'none');
    }
}

function tabComplete(CursorPos: number) {
    if ((<string>messagefield.val()).length === 0)
        return;
    let messageSplit = (<string>messagefield.val()).substring(0, CursorPos);
    let matches = Array.from(messageSplit['matchAll'](/[\r\n\t ]/gm));
    let lastSplit = 0;
    if (matches.length > 0) {
        lastSplit = (<RegExpMatchArray>matches[matches.length - 1]).index + 1;
    }
    let toComplete = messageSplit.substring(lastSplit);
    if (toComplete.length < 1)
        return;
    if (toComplete.toLowerCase().startsWith("@") && toComplete.length > 1) {
        for (let username in userlist.entries()) {
            if (username[1] !== null && username[1].toLowerCase().startsWith(toComplete.substring(1).toLowerCase())) {
                let mIn = (<string>messagefield.val()).substr(0, lastSplit) + "@" + username[1] + " ";
                messagefield.val(mIn + (<string>messagefield.val()).substr(CursorPos));
                messagefield.prop('selectionStart', mIn.length);
                messagefield.prop('selectionEnd', mIn.length);
                return;
            }
        }
    }
    else if (toComplete.toLowerCase().startsWith("/") && toComplete.length > 1) {
        for (let commands in commandlist.entries()) {
            if (commands !== null && commands[1].toLowerCase().startsWith(toComplete.substring(1).toLowerCase())) {
                let mIn = (<string>messagefield.val()).substr(0, lastSplit) + "/" + commands[1] + " ";
                messagefield.val(mIn + (<string>messagefield.val()).substr(CursorPos));
                messagefield.prop('selectionStart', mIn.length);
                messagefield.prop('selectionEnd', mIn.length);
                return;
            }
        }
    } else {
        for (let x in emotekeylist) {
            if (emotekeylist[x].toLowerCase().startsWith(toComplete.toLowerCase())) {
                let mIn = (<string>messagefield.val()).substr(0, lastSplit) + emotekeylist[x] + " ";
                messagefield.val(mIn + (<string>messagefield.val()).substr(CursorPos));
                messagefield.prop('selectionStart', mIn.length);
                messagefield.prop('selectionEnd', mIn.length);
                break;
            }
        }
    }
}

function makeMention(text: string) {
    return '<em class="d-flex w-100 mention">' + text + '</em>';
}

function uname_name_click(e){
    if(e.originalEvent.ctrlKey){
        e.preventDefault();
        (<HTMLInputElement>document.getElementById('messageinput')).value += '@' + e.target.title + ' ';
    }
}

function setautoscroll(value: boolean) {
    autoscroll = value;
    (<HTMLInputElement>document.getElementById('autoscroll')).checked = value;
    if(value) {
        hideInfo();
    }
}

function messagesScroll(event: WheelEvent) {
    if(event.deltaY>0) { //Down
        if(lastScrollDirection === 1) {
        let messagediv = <HTMLDivElement>document.getElementById('messages');
            if(messagediv.scrollTop === (messagediv.scrollHeight - messagediv.offsetHeight)) {
                setautoscroll(true);
                lastScrollDirection = 0;
            }
        } else {
            lastScrollDirection = 1;
        }
    } else { //Up
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
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor);
    if(check) {
        $('#sendbtn').css('display', 'block');
    } else {
        $('#sendbtn').css('display', 'none');
    }
}

function updateScroll() {
    if (checkOverflow(<HTMLDivElement>document.querySelector('#messages'))) { //check if chat would overflow currentSize and refresh scrollbar
        //$('.nano').nanoScroller();
        if(autoscroll) {
            let chatdiv = <HTMLDivElement>document.querySelector('#messages');
            chatdiv.scrollTop = chatdiv.scrollHeight;
        }
    }
}

// Determines if the passed element is overflowing its bounds, either vertically or horizontally.
// Will temporarily modify the "overflow" style to detect this if necessary.
function checkOverflow(el: HTMLElement) {
    let curOverflow = el.style.overflow;

    if (!curOverflow || curOverflow === "visible")
        el.style.overflow = "hidden";

    let isOverflowing = el.clientWidth < el.scrollWidth
        || el.clientHeight < el.scrollHeight;

    el.style.overflow = curOverflow;

    return isOverflowing;
}

function getMessageHistory() {
    $.getJSON(`/api/chathistory?username=${ownusername}`, function (result) {
        if (Object.keys(result).length > 0) {
            handleMessageHistory(result);
        } else {
            $.getJSON(`/api/chathistory`, function (result) {
                if (Object.keys(result).length > 0) {
                    handleMessageHistory(result);
                }
            });
        }
    });
}

function handleMessageHistory(history) {
    $('#messages').empty();
            // iterate over each message from the JSON
    for (let msg in history) {
        let m = history[msg];
        switch (m["content_type"]) {
            case 'message':
                newMessageHandler(m);
                break;
            case 'embed':
                addEmbed(m);
                break;
        }
    }
    if (checkOverflow(<HTMLDivElement>document.querySelector('#messages'))) {
        //$('.nano').nanoScroller();
        if(autoscroll) {
            let chatdiv = <HTMLDivElement>document.querySelector('#messages');
            chatdiv.scrollTop = chatdiv.scrollHeight;
        }
    }
}

$('#fileinput').on('change', function (e) {

    let file = (<FileList>(<HTMLInputElement>document.getElementById('fileinput')).files)[0];
    if (file.size > 1024*1024*3) {
        alert('max upload size is 3M');
        e.preventDefault();
        return false;
    }
    uploadImage(file);
});

function uploadImage(file: File){
    let fd = new FormData();
    fd.append('file', file);
    $.ajax({
    url: '/api/upload/',
    type: 'POST',

    data: fd,
    cache: false,
    contentType: false,
    processData: false,

    success: function (data, b, jqXHR) {
        if(jqXHR.status === 200) {
            messagefield.val(messagefield.val() + " " + window.location.protocol + "//" + window.location.host + data);
        }
    }
    });
}


function inputButtonClick() {
    let evt = document.createEvent('MouseEvent');
    evt.initEvent('click', true, false);
    (<HTMLInputElement>document.getElementById('fileinput')).dispatchEvent(evt);
}
function getCommands(){
    $.getJSON('/api/commands', function (result) {
        if (Object.keys(result).length > 0) {
            if (JSON.stringify(emotelist) === JSON.stringify(result)) {
                return;
            }
            commandlist = result;
        }
    });
}
function handlePaste(e: ClipboardEvent){
    let clipboardData, pastedData;

    e.stopPropagation();

    clipboardData = <DataTransfer>e.clipboardData;
    // clipboardData = e.clipboardData || window.clipboardData;
    let items = clipboardData.items;
    pastedData = clipboardData.getData('Text');
    
    for (let i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") == -1) continue;
        e.preventDefault();
        imagecache = <File>items[i].getAsFile();
        uploadImage(imagecache)
        //finally try as text
        if(items[i].type.indexOf("Text")>0){
            console.log(items[i]);
            break;
        }
    }
}





//More info here: https://developer.mozilla.org/de/docs/Web/API/notification

var notifications = new Array();

window.onload = function () {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (checkPermission()) {
    //    // If it's okay let's create a notification
    //    new Notification("Welcome back!");
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (checkPermission()) {
                displayNotifyMode();
                new Notification("This is how a notification would appear!");
            }
        });
    }
    // At last, if the user has denied notifications, and you 
    // want to be respectful there is no need to bother them any more.
};

//create new notification with the variable "text" as content
function newNotification(text: string) {
    var notification = new Notification(text);
    notifications.push(notification);
}

//check if permission to show notification is granted
function checkPermission() {
    if (Notification.permission === "granted") {
        return true;
    } else {
        return false;
    }
}

function disconnectNotification() {
    if (checkPermission()) {
        newNotification("You have been disconnected from the chat!");
    }
}

function closeAllNotifications() {
    if(notifications.length > 0){
        notifications.forEach(closeNotification);
    }
}

function closeNotification(item: Notification){
    item.close();
}

function displayNotifyMode() {
    if(checkPermission() == true){
        $('#notify-mode').css('display', 'flex');
    } else {
        $('#notify-mode').css('display', 'none');
    }
}