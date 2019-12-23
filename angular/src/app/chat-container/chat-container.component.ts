import { Component, OnInit, Input } from '@angular/core';
import { AppComponent } from '../app.component';
import { IMessage } from 'src/interfaces/IMessage';
import { ApiService } from 'src/services/api.service';
import { IEmbed } from 'src/interfaces/IEmbed';
import { IFields } from 'src/interfaces/IFields';
import { IMedia } from 'src/interfaces/IMedia';
import { MessagehistoryService } from 'src/services/messagehistory.service';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.css']
})
export class ChatContainerComponent implements OnInit {

    constructor(private apiService: ApiService, private messageHistoryService: MessagehistoryService) { }

    @Input()
    ownusername: string;
    @Input()
    autoscroll: boolean;

    // Determines if the passed element is overflowing its bounds, either vertically or horizontally.
    // Will temporarily modify the "overflow" style to detect this if necessary.
    static checkOverflow(el: HTMLDivElement) {
        console.log(el);
        const curOverflow = el.style.overflow;
        if (!curOverflow || curOverflow === 'visible') {
            el.style.overflow = 'hidden';
        }

        const isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
        el.style.overflow = curOverflow;

        return isOverflowing;
    }

    updateScroll() {
        if (ChatContainerComponent.checkOverflow(document.getElementById('messages') as HTMLDivElement)) { // check if chat would overflow currentSize and refresh scrollbar
            // $('.nano').nanoScroller();
            if (this.autoscroll) {
                const chatdiv = document.querySelector('#messages') as HTMLDivElement;
                chatdiv.scrollTop = chatdiv.scrollHeight;
                return true;
            }
            return false;
        }
    }

    ngOnInit() {
        this.handleMessageHistory();
    }

    handleMessageHistory() {
        $('#messages').empty();
        // iterate over each message from the JSON
        this.apiService.getMessageHistory(this.ownusername).forEach(element => {
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
        this.updateScroll();
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
                    embedImage.onload = () => { this.updateScroll(); };
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
            embedThumbnail.onload = () => { this.updateScroll(); };
            embedThumbnail.classList.add('embed-thumbnail', 'ml-auto', 'mt-3');
            embedHeader.append(embedThumbnail);
        }

        embedContainer.append(embedFooterContainer);

        $('#messages').append(embedContainer);
    }

    // tslint:disable-next-line: no-any
    uname_name_click(e: any) {
        if (e.originalEvent.ctrlKey) {
            e.preventDefault();
            (document.getElementById('messageinput') as HTMLInputElement).value += '@' + e.target.title + ' ';
        }
    }
}
