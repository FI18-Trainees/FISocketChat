import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as $ from 'jquery';
import * as io from 'socket.io-client';

import { IMessage } from '../interfaces/IMessage';
import { IEmbed } from '../interfaces/IEmbed';
import { NotificationService } from 'src/services/notification.service';
import { InputContainerComponent } from './input-container/input-container.component';
import { ChatContainerComponent } from './chat-container/chat-container.component';
import { ApiService } from 'src/services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

    @ViewChild(ChatContainerComponent, {static: true}) chatComponent;

    constructor(private notifyService: NotificationService, private apiService: ApiService) {}

    title = 'FISocketChat';

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
    lastScrollDirection = 0; // 1 is down; 0 is none; -1 is up
    historyPointer = 0;
    autoscroll = true;
    imagecache;

    messageHistory: string[] = [];
    messagefield: JQuery<HTMLInputElement> = $('#messageinput');
    infobox = $('#infobox');
    errorbox = $('#errorbox');

    ngAfterViewInit(): void {
        this.chatComponent.updateScroll();
    }

    ngOnInit(): void {
        const accessToken = this.getCookie('access_token');
        const socket = io.connect(window.location.href.slice(0, -1),
        {
            secure: true,
            transports: ['polling', 'websocket'],
            query: 'token=' + accessToken ? accessToken : '',
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
                    this.chatComponent.newMessageHandler(msg);
                    break;
                case 'embed':
                    this.chatComponent.addEmbed(msg as IEmbed);
                    break;
                default:
                    break;
            }

            // check if chat would overflow currentSize and refresh scrollbar
            if (!this.chatComponent.updateScroll) {
                this.showInfo('There are new Messages below. Click here to scroll down.', 0, () => {this.setautoscroll(true); this.hideInfo(); this.chatComponent.updateScroll(); });
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
            }
            if (status.hasOwnProperty('loginmode')) {
                if (status.loginmode) {
                    $('#username-item').css('display', 'none');
                    this.loginmode = true;
                } else {
                    $('#username-item').css('display', 'block');
                    $('#user_name').val('DebugUser');
                    $('logininfo_sidebar').css('display', 'none');
                    this.loginmode = false;
                }
            }
            if (status.hasOwnProperty('on_ready')) {
                this.updateEmoteMenu();
                (document.getElementById('emotebtn') as HTMLButtonElement).addEventListener('click', InputContainerComponent.toggleEmoteMenu);

                this.commandlist = this.apiService.getCommands();
                // this.messageHistory = this.apiService.getMessageHistory(this.ownusername);

                InputContainerComponent.mobileAndTabletcheck();
                this.notifyService.initializeNotifications();
                this.notifyService.displayNotifyMode();
                $('#notification-mode').val(this.getCookie('notificationmode') as string);

                // tslint:disable-next-line: no-unused-expression
                $('messageinput').on('paste', () => {this.handlePaste; });
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

    setUserCount(count: string) {
        $.ajax({
            url: 'api/user',
        }).done(data => {
            $('#usercount').prop('title', data.join(', ')).text('Usercount: ' + count);
            this.userlist = data;
            this.userlist.push('everyone');
        });
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
        InputContainerComponent.toggleEmoteMenu();
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

    handlePaste(e: ClipboardEvent) {
        let clipboardData;
        let pastedData: string;

        e.stopPropagation();

        clipboardData = e.clipboardData as DataTransfer;
        // clipboardData = e.clipboardData || window.clipboardData;
        const items = clipboardData.items;
        pastedData = clipboardData.getData('Text');

        for (const item of items) {
            // Skip content if not image
            if (item.type.indexOf('image') === -1) { continue; }
            e.preventDefault();
            this.imagecache = item.getAsFile() as File;
            this.uploadImage(this.imagecache);
            // finally try as text
            if (item.type.indexOF('Text') > 0) {
                console.log(item);
                break;
            }
        }
    }
}
