import { Component, OnInit } from '@angular/core';
import * as $ from 'jQuery';
import * as io from 'socket.io-client';

import { IMessage } from '../interfaces/IMessage';
import { IEmbed } from '../interfaces/IEmbed';
import { IMedia } from '../interfaces/IMedia';
import { IFields } from '../interfaces/IFields';
import { NotificationService } from 'src/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FISocketChat';

  constructor(private notifyService: NotificationService) {}

    // localStorage.debug = '*';

    focused = true;
    unread = 0;
    emotelist: JSON;
    emotekeylist: string[];
    commandlist: string[];
    loginmode = true;
    cooldown = 0;
    ownusername: string;
    userlist: string[];
    notificationmode = 'no';
    autoscroll = true;
    lastScrollDirection = 0; // 1 is down; 0 is none; -1 is up
    historyPointer = 0;

    imagecache;

    messageHistory: string[] = [];
    messagefield: JQuery<HTMLInputElement> = $('#messageinput');
    infobox = $('#infobox');
    errorbox = $('#errorbox');

    ngOnInit(): void {
        const socket = io.connect(window.location.href.slice(0, -1),
        {
            secure: true,
            transports: ['polling', 'websocket'],
            query: 'token=" + getCookie("access_token")',
        });
        window.onfocus = () => {
            document.title = 'Socket.IO chat';
            this.unread = 0;
            this.focused = true;
            if (!socket.connected) {
            this.setUserCount('offline');
            socket.connect();
            }
            this.notifyService.closeAllNotifications();
        };
        window.onblur = () => {
            this.focused = false;
        };

        this.messagefield.on('keydown', e => {
            console.log('test');
            switch (e.key) {
                case 'Tab':
                    // tab key
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.messagefield.val(this.messagefield.val() + '\t');
                    } else {
                        this.tabComplete(this.messagefield.prop('selectionStart'));
                    }
                    break;
                case 'Enter':
                    if (e.key === 'Enter' && !e.shiftKey) {
                        // Enter was pressed without shift key
                        // prevent default behavior
                        e.preventDefault();
                        $('form').trigger('submit');
                    }
                    break;
                case 'ArrowUp':
                    // up arrow
                    if (this.messagefield.val() === '' || this.messagefield.val() === this.messageHistory[this.historyPointer]) {
                        this.historyPointer -= 1;
                        if (this.historyPointer < 0) {
                            this.historyPointer = 0;
                        }
                        this.messagefield.val(this.messageHistory[this.historyPointer]);
                    }
                    break;
                case 'ArrowDown':
                    // down arrow
                    if ((this.messagefield.val() as string).trim() === '' || this.messagefield.val() === this.messageHistory[this.historyPointer]) {
                        this.historyPointer += 1;
                        if (this.historyPointer > this.messageHistory.length - 1) {
                            this.historyPointer = this.messageHistory.length - 1;
                        }
                        this.messagefield.val(this.messageHistory[this.historyPointer]);
                    }
                    break;
                default:
                    break;
            }
    });

        $('form').on('submit', e => {
            e.preventDefault(); // prevents page reloading
            if (this.cooldown !== 0) {
                this.showError('Sending messages to fast!');
                return;
            }
            this.cooldown = window.setTimeout(() => {
                this.cooldown = 0;
            }, 400);
            if ((this.messagefield.val() as string).trim() === '') {
                this.showError('Invalid message.');
                return false;
            }
            this.messageHistory.push(this.messagefield.val() as string);

            this.historyPointer = this.messageHistory.length;
            let u = $('#user_name').val() as string;

            let eventName = 'chat_message';
            if ((this.messagefield.val() as string).startsWith('/')) {
                eventName = 'chat_command';
            }

            if (!this.loginmode) {
                if (u.trim() === '') {
                    this.showError('Username must be given.');
                    return false;
                } else {
                    this.ownusername = u.toLowerCase();
                }
            } else {
                u = 'Shawn'; // username will be replaced with value from userconfig, but must be given
            }
            socket.emit(eventName, {
                display_name: u,
                message: this.messagefield.val(),
                token: this.getCookie('access_token')
            });
            this.messagefield.val('');
            return false;
        });

        socket.on('error', (msg: {message: string}) => {
            this.showError(msg.message);
        });
        socket.on('connect', () => {
            this.changeOnlineStatus(true);
        });
        socket.on('connect_error', (error: string) => {
            this.showError('Connection failed.');
            console.log(error);
            this.changeOnlineStatus(false);
            this.reconnect();
        });
        socket.on('connect_timeout', (timeout: number) => {
            this.changeOnlineStatus(false);
            console.log(timeout);
            this.reconnect();
        });
        socket.on('disconnect', (reason: string) => {
            this.showError('Disconnected.');
            this.notifyService.disconnectNotification();
            this.changeOnlineStatus(false);
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
                this.reconnect();
            }
        });
        socket.on('chat_message', (msg: IMessage) => {
            switch (msg.content_type) {
                case 'message':
                    const mentioned = (msg.content.toLowerCase().search('@' + this.ownusername) !== -1) || (msg.content.toLowerCase().search('@everyone') !== -1);
                    if (mentioned) {
                        msg.content = this.makeMention(msg.content);
                        if (this.notifyService.checkPermission() && this.notificationmode !== 'no') {
                            this.notifyService.newNotification('You have been mentioned!');
                        }
                    }

                    // check if username of last message is identical to new message
                    this.newMessageHandler(msg);
                    break;
                case 'embed':
                    this.addEmbed(msg as IEmbed);
                    break;
                default:
                    break;
            }

            // check if chat would overflow currentSize and refresh scrollbar
            if (this.checkOverflow(document.getElementById('messages') as HTMLDivElement)) {
                // $('.nano').nanoScroller();
                if (this.autoscroll) {
                    const chatdiv: HTMLDivElement = document.getElementById('messages') as HTMLDivElement;
                    chatdiv.scrollTop = chatdiv.scrollHeight;
                } else {
                    this.showInfo('There are new Messages below. Click here to scroll down.', 0, () => {this.setautoscroll(true); this.hideInfo(); this.updateScroll(); });
                }
            }
            if (!this.focused) {
                this.unread++;
                document.title = 'Socket.IO chat' + ' (' + this.unread + ')';
                if (this.notifyService.checkPermission() && this.notificationmode === 'all') {
                    if (this.unread === 1) {
                        this.notifyService.newNotification(this.unread + ' unread message!');
                    } else if (this.unread % 5 === 0) {
                        this.notifyService.newNotification(this.unread + ' unread messages!');
                    }
                }
            }
            // if number of messages > 100 remove first message
            if ($('#messages > div').length > 100) {
                $('#messages').children().first().remove();
            }
            $('.chat').animate({scrollTop: $('.chat').prop('scrollHeight')}, 0);
        });
        socket.on('status', (status: {count?: string, username?: string, loginmode?: string, chat_color?: string}) => {
            if (status.hasOwnProperty('count')) {
                this.setUserCount(status.count as string);
            }
            if (status.hasOwnProperty('username')) {
                this.ownusername = (status.username as string).toLowerCase();
                $('#logininfo_name').text(`Logged in as ${status.username}`).css('color', status.chat_color as string);
                $('#logininfo_picture').attr('src', `https://profile.zaanposni.com/pictures/${this.ownusername}.png`);
            }
            if (status.hasOwnProperty('loginmode')) {
                if (status.loginmode) {
                    $('#username-item').css('display', 'none');
                    this.loginmode = true;
                } else {
                    $('#username-item').css('display', 'block');
                    $('#user_name').val('DebugUser');
                    $('logininfo_sitebar').css('display', 'none');
                    this.loginmode = false;
                }
            }
            if (status.hasOwnProperty('on_ready')) {
                this.updateEmoteMenu();
                (document.getElementById('emotebtn') as HTMLButtonElement).addEventListener('click', this.toggleEmoteMenu);

                this.getCommands();

                this.mobileAndTabletcheck();
                this.notifyService.initializeNotifications();
                this.notifyService.displayNotifyMode();
                $('#notification-mode').val(this.getCookie('notificationmode') as string);

                // tslint:disable-next-line: no-unused-expression
                $('messageinput').on('paste', () => {this.handlePaste; });

                this.getMessageHistory();
            }
        });

        $(document).on('keydown', event => {
            if (event.ctrlKey) {
                $('.message-name').css('cursor', 'pointer');
            }
        });

        $(document).on('keyup', event => {
            if (event.ctrlKey) {
                $('.message-name').css('cursor', 'default');
            }
        });

        $('#notification-mode').on('change', () => {
            const notificationmode = (($('#notification-mode') as JQuery<HTMLSelectElement>).val() as string);
            document.cookie = `notificationmode=${notificationmode}; expires=Thu, 01 Jan 2023 00:00:00 UTC; path=/`;
        });

        $('#fileinput').on('change', e => {
            const file = ((document.getElementById('fileinput') as HTMLInputElement).files as FileList)[0];
            if (file.size > 1024 * 1024 * 3) {
                alert('max upload size is 3M');
                e.preventDefault();
                return false;
            }
            this.uploadImage(file);
            return;
        });
    }

reconnect() {
    setTimeout(() => {
        io.connect();
    }, 3000);
}

newMessageHandler(msg: IMessage) {
    if ($('#messages :last-child div h2 div').prop('title') === msg.author.username) {
        if (msg.append_allow) {
            this.appendMessage(msg);
            return;
        }
    }
    this.addNewMessage(msg);
}

addNewMessage(msg: IMessage) {

    const messageContainer = $('<div class="message-container d-flex border-bottom p-2">');
    const messageHeader = $('<h2 class="message-header d-inline-flex align-items-center mb-1">');
    const messageBody = $('<div class="message-body w-100">');
    const messageThumbnail = $('<img class="message-profile-image mr-3 rounded-circle" src="' + msg.author.avatar + '">');
    const messageUsername = $('<div class="message-name">').prop('title', msg.author.username).text(msg.author.display_name).css('color', msg.author.chat_color).on('click', this.uname_name_click);
    const messageTimestamp = $('<time class="message-timestamp ml-1">').prop('title', msg.full_timestamp).text(msg.timestamp);
    const messageContent = $('<div class="message-content text-white w-100 pb-1">').html(msg.content);

    messageContainer.append(messageThumbnail, messageBody);
    messageBody.append(messageHeader, messageContent);
    messageHeader.append(messageUsername, messageTimestamp);
    $('#messages').append(messageContainer);
}

appendMessage(msg: IMessage) {
    $('#messages .message-container').last().children().append($('<div class="message-content text-white w-100 pb-1">').html(msg.content));
    $('#messages .message-header').last().children('time').text(msg.timestamp);
}

setUserCount(count: string) {
    $.ajax({
        url: 'api/user',
    }).done(data => {
        $('#usercount').prop('title', data.join(', ')).text('Usercount: ' + count);
        this.userlist = data;
        this.userlist.push('everyone');
    });
}

addEmbed(msg: IEmbed) {

    const embedContainer = $('<div class="embed-container d-flex flex-column border-bottom px-3 my-3 w-75">');
    const embedHeader = $('<div class="embed-header d-flex flex-wrap align-items-center mb-1">');

    const embedAuthorThumbnail = $('<img class="embed-profile-image rounded-circle mr-2" src="' + msg.author.avatar + '">');
    const embedAuthorName = $('<div class="embed-author-name">').prop('title', msg.author.username).text(msg.author.display_name).css('color', msg.author.chat_color).on('click', this.uname_name_click);
    const embedTitle = $('<div class="embed-title py-2">').text(msg.title);

    const embedFooterContainer = $('<div class="embed-footer-container d-inline-flex pb-1 mt-3">');
    const timestamp = new Date(msg.full_timestamp);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric', second: 'numeric'};
    const embedTimestamp = $('<span class="embed-timestamp text-muted ml-auto">').text(timestamp.toLocaleDateString('de-DE', dateOptions));

    embedContainer.append(embedHeader);
    embedContainer.append(embedTitle);
    embedHeader.append(embedAuthorThumbnail);
    embedHeader.append(embedAuthorName);
    embedFooterContainer.append(embedTimestamp);

    if (msg.hasOwnProperty('text')) {
        $('<p class="embed-text">').html(msg.text as string).insertAfter(embedTitle);
    }
    if (msg.hasOwnProperty('fields')) {
        const fields = msg.fields;
        const embedFieldContainer = $('<div class="embed-field-container d-flex flex-wrap justify-content-between py-3">');
        embedContainer.append(embedFieldContainer);
        (fields as IFields[]).forEach(item => {
            const embedTopicContainer = $('<div class="embed-topic-container m-1">');
            const embedTopic = $('<p class="embed-topic">').text(item.topic);
            const embedTopicValue = $('<p class="embed-topic-value">').html(item.value);

            embedFieldContainer.append(embedTopicContainer);
            embedTopicContainer.append(embedTopic, embedTopicValue);
        });
    }

    if (msg.hasOwnProperty('media')) {
        const embedMediaContainer = $('<div class="embed-media-container">');
        switch ((msg.media as IMedia).media_type) {
            case 'audio':
                const embedAudio: JQuery<HTMLAudioElement> = $('<audio class="audio-embed" controls preload="metadata"/>');
                embedAudio.attr('src', (msg.media as IMedia).media_url) ;
                embedMediaContainer.append(embedAudio);
                break;
            case 'video':
                const embedVideo: JQuery<HTMLVideoElement> = $('<video class="video-embed" controls preload="metadata"/>');
                embedVideo.attr('src', (msg.media as IMedia).media_url);
                // embed_video.addEventListener('loadedmetadata', updateScroll);
                embedMediaContainer.append(embedVideo);
                break;
            case 'img':
                const embedImage = new Image();
                embedImage.src = (msg.media as IMedia).media_url;
                embedImage.onload = () => {this.updateScroll(); };
                embedMediaContainer.append(embedImage);
                break;
            default:
                throw Error('wrong media type');
        }
        embedContainer.append(embedMediaContainer);
    }
    if (msg.hasOwnProperty('footer')) {
        const embedFooter = $('<span class="embed-footer">').text(msg.footer as string);
        embedFooterContainer.prepend(embedFooter);
    }
    if (msg.hasOwnProperty('color')) {
        embedContainer.css('border-left-color', msg.color as string);
    }
    if (msg.hasOwnProperty('thumbnail')) {
        const embedThumbnail = new Image();
        embedThumbnail.src = msg.thumbnail as string;
        embedThumbnail.onload = () => {this.updateScroll(); };
        embedThumbnail.classList.add('embed-thumbnail', 'ml-auto', 'mt-3');
        embedHeader.append(embedThumbnail);
    }

    embedContainer.append(embedFooterContainer);

    $('#messages').append(embedContainer);
}

showError(message: string) {
    this.errorbox.text(message);
    this.errorbox.fadeIn('slow');
    setTimeout(() => {
        this.hideError();
    }, 2000);
}

// tslint:disable-next-line: no-any
showInfo(message: string, fadeoutdelay: number, onclick: any) {
    this.infobox.text(message);
    this.infobox.fadeIn('slow');
    if (onclick != null) {
        this.infobox.on('click', onclick); // doesn't work yet
    }
    if (fadeoutdelay > 0) {
        setTimeout(() => {
            this.hideInfo();
        }, fadeoutdelay);
    }
}

changeOnlineStatus(online: boolean) {
    if (online) {
        $('#online-status').text('Connected').addClass('badge-success').removeClass('badge-danger');
    } else {
        $('#online-status').text('Disconnected').addClass('badge-danger').removeClass('badge-success');
    }
}

hideError() {
    this.errorbox.fadeOut('slow');
}

hideInfo() {
    this.infobox.fadeOut('slow');
    this.infobox.off('click');
}

addEmoteCode(emote: string) {
    this.messagefield.val(this.messagefield.val() + ' ' + emote + ' ');
    this.toggleEmoteMenu();
    this.messagefield.trigger('focus');
}

updateEmoteMenu() {
    // retrieving the emotes as JSON from the API
    $.getJSON('/api/emotes', result => {
        // checking if the JSON even contains emotes.
        if (Object.keys(result).length > 0) {
            if (JSON.stringify(this.emotelist) === JSON.stringify(result)) {
                return;
            }
            this.emotelist = result;
            // getting the emote menu
            const emoteMenu = $('#emoteMenu');
            // clearing the emote menu
            emoteMenu.empty();
            // iterate over the emotes from the JSON
            for (const emote in result) {
                // jumping over the hidden ones.
                if (result[emote].menuDisplay) {
                    const emoteitem = document.createElement('a');
                    emoteitem.classList.add('cursor-pointer');
                    emoteitem.innerHTML = result[emote].menuDisplayCode;
                    emoteitem.onclick = () => {
                        this.addEmoteCode(emote);
                    };
                    emoteMenu.append(emoteitem);
                    emoteMenu.append(document.createElement('wbr'));
                }
            }
            this.emotekeylist = Object.keys(this.emotelist);
            this.emotekeylist.sort((a, b) => {
                const varA = a.toUpperCase();
                const varB = b.toUpperCase();
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

getCookie(name: string) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return (parts.pop() as string).split(';').shift();
    }
    return;
}

toggleEmoteMenu() {
    const object = $('#emoteMenu');
    if (object.css('display') === 'none' || object.css('emoteMenu') === '') {
        object.css('display', 'block');
    } else {
        object.css('display', 'none');
    }
}

tabComplete(cursorPos: number) {
    if ((this.messagefield.val() as string).length === 0) {
        return;
    }
    // tslint:disable-next-line: no-any
    const messageSplit: any = (this.messagefield.val() as string).substring(0, cursorPos);
    const matches = Array.from(messageSplit.matchAll(/[\r\n\t ]/gm));
    let lastSplit = 0;
    if (matches.length > 0) {
        lastSplit = ((matches[matches.length - 1] as RegExpMatchArray).index as number) + 1 ;
    }
    const toComplete = messageSplit.substring(lastSplit);
    if (toComplete.length < 1) {
        return;
    }
    if (toComplete.toLowerCase().startsWith('@') && toComplete.length > 1) {
        this.userlist.some(username => {
            if (username !== null && username.toLowerCase().startsWith(toComplete.substring(1).toLowerCase())) {
                const mIn = (this.messagefield.val() as string).substr(0, lastSplit) + '@' + username + ' ';
                this.messagefield.val(mIn + (this.messagefield.val() as string).substr(cursorPos));
                this.messagefield.prop('selectionStart', mIn.length);
                this.messagefield.prop('selectionEnd', mIn.length);
                return true;
            }
            return false;
        });
    } else if (toComplete.toLowerCase().startsWith('/') && toComplete.length > 1) {
        this.commandlist.some(command => {
            if (command !== null && command.toLowerCase().startsWith(toComplete.substring(1).toLowerCase())) {
                const mIn = (this.messagefield.val() as string).substr(0, lastSplit) + '/' + command + ' ';
                this.messagefield.val(mIn + (this.messagefield.val() as string).substr(cursorPos));
                this.messagefield.prop('selectionStart', mIn.length);
                this.messagefield.prop('selectionEnd', mIn.length);
                return true;
            }
            return false;
        });
    } else {
        this.emotekeylist.some(x => {
            if (x.toLowerCase().startsWith(toComplete.toLowerCase())) {
                const mIn = (this.messagefield.val() as string).substr(0, lastSplit) + x + ' ';
                this.messagefield.val(mIn + (this.messagefield.val() as string).substr(cursorPos));
                this.messagefield.prop('selectionStart', mIn.length);
                this.messagefield.prop('selectionEnd', mIn.length);
                return true;
            }
            return false;
        });
    }
}

makeMention(text: string) {
    return '<em class="d-flex w-100 mention">' + text + '</em>';
}

// tslint:disable-next-line: no-any
uname_name_click(e: any) {
    if (e.originalEvent.ctrlKey) {
        e.preventDefault();
        (document.getElementById('messageinput') as HTMLInputElement).value += '@' + e.target.title + ' ';
    }
}

setautoscroll(value: boolean) {
    this.autoscroll = value;
    (document.getElementById('autoscroll') as HTMLInputElement).checked = value;
    if (value) {
        this.hideInfo();
    }
}

messagesScroll(event: WheelEvent) {
    if (event.deltaY > 0) { // Down
        if (this.lastScrollDirection === 1) {
        const messagediv = document.getElementById('messages') as HTMLDivElement;
        if (messagediv.scrollTop === (messagediv.scrollHeight - messagediv.offsetHeight)) {
                this.setautoscroll(true);
                this.lastScrollDirection = 0;
            }
        } else {
            this.lastScrollDirection = 1;
        }
    } else { // Up
        if (this.lastScrollDirection === -1) {
            this.setautoscroll(false);
            this.lastScrollDirection = 0;
        } else {
            this.lastScrollDirection = -1;
        }
    }
}

mobileAndTabletcheck() {
    let check = false;
    ((a) => {if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) { check = true; } })(navigator.userAgent || navigator.vendor);
    if (check) {
        $('#sendbtn').css('display', 'block');
    } else {
        $('#sendbtn').css('display', 'none');
    }
}

updateScroll() {
    if (this.checkOverflow(document.getElementById('messages') as HTMLDivElement)) { // check if chat would overflow currentSize and refresh scrollbar
        // $('.nano').nanoScroller();
        if (this.autoscroll) {
            const chatdiv = document.querySelector('#messages') as HTMLDivElement;
            chatdiv.scrollTop = chatdiv.scrollHeight;
        }
    }
}

// Determines if the passed element is overflowing its bounds, either vertically or horizontally.
// Will temporarily modify the "overflow" style to detect this if necessary.
checkOverflow(el: HTMLDivElement) {
    const curOverflow = el.style.overflow;
    if (!curOverflow || curOverflow === 'visible') {
        el.style.overflow = 'hidden';
    }

    const isOverflowing = el.clientWidth < el.scrollWidth
        || el.clientHeight < el.scrollHeight;

    el.style.overflow = curOverflow;

    return isOverflowing;
}

getMessageHistory() {
    $.getJSON(`/api/chathistory?username=${this.ownusername}`, result => {
        if (Object.keys(result).length > 0) {
            this.handleMessageHistory(result);
        } else {
            $.getJSON(`/api/chathistory`, result2 => {
                if (Object.keys(result2).length > 0) {
                    this.handleMessageHistory(result2);
                }
            });
        }
    });
}

handleMessageHistory(history: IMessage[]) {
    $('#messages').empty();
    // iterate over each message from the JSON
    history.forEach(element => {
        switch (element.content_type) {
            case 'message':
                this.newMessageHandler(element);
                break;
            case 'embed':
                this.addEmbed(element as IEmbed);
                break;
            default:
                break;
        }
    });
    if (this.checkOverflow(document.getElementById('messages') as HTMLDivElement)) {
        // $('.nano').nanoScroller();
        if (this.autoscroll) {
            const chatdiv = document.getElementById('messages') as HTMLDivElement;
            chatdiv.scrollTop = chatdiv.scrollHeight;
        }
    }
}

uploadImage(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    $.ajax({
    url: '/api/upload/',
    type: 'POST',

    data: fd,
    cache: false,
    contentType: false,
    processData: false,

    success: (data, b, jqXHR) => {
        if (jqXHR.status === 200) {
            this.messagefield.val(this.messagefield.val() + ' ' + window.location.protocol + '//' + window.location.host + data);
        }
    }
    });
}

inputButtonClick() {
    const evt = document.createEvent('MouseEvent');
    evt.initEvent('click', true, false);
    (document.getElementById('fileinput') as HTMLInputElement).dispatchEvent(evt);
}

getCommands() {
    $.getJSON('/api/commands', result => {
        if (Object.keys(result).length > 0) {
            if (JSON.stringify(this.emotelist) === JSON.stringify(result)) {
                return;
            }
            this.commandlist = result;
        }
    });
}

handlePaste(e: ClipboardEvent) {
    let clipboardData, pastedData;

    e.stopPropagation();

    clipboardData = e.clipboardData as DataTransfer;
    // clipboardData = e.clipboardData || window.clipboardData;
    const items = clipboardData.items;
    pastedData = clipboardData.getData('Text');

    for (let i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf('image') === -1) { continue; }
        e.preventDefault();
        this.imagecache = items[i].getAsFile() as File;
        this.uploadImage(this.imagecache);
        // finally try as text
        if (items[i].type.indexOf('Text') > 0) {
            console.log(items[i]);
            break;
        }
    }
}
}
