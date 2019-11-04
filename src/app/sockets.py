# -*- coding: utf-8 -*-
from datetime import datetime
import requests
import re
import time

from flask_socketio import emit
import re, time
from validators import url as val_url

from . import socketio, emotehandler, emoteregex, htmlregex, linkregex, youtuberegex, user_manager, verify_token, \
    logindisabled, others, imageregex, request, user_limit
from .shell import *
from . import handle_command as command_handler

SHL = Console("Init")
others.new_emotes = False


class System:
    display_name = "System"
    username = "System"
    user_color = "#FF0000"
    avatar = "/public/img/system.png"
    system = True

    def system_emit(self, message):
        emit('chat_message',
             {
                 'timestamp': datetime.now().strftime("%H:%M:%S"),
                 'display_name': self.display_name,
                 'username': self.username,
                 'user_color': self.user_color,
                 'avatar': self.avatar,
                 'message': message,
                 'system': self.system
             })

    def system_broadcast(self, message):
        emit('chat_message',
             {
                 'timestamp': datetime.now().strftime("%H:%M:%S"),
                 'display_name': self.display_name,
                 'username': self.username,
                 'user_color': self.user_color,
                 'avatar': self.avatar,
                 'message': message,
                 'system': self.system
             }, broadcast=True)


@socketio.on('chat_command')
def handle_command(command):
    if user_limit.check_cooldown(request.sid):
        if logindisabled:
            SHL.output(f"{yellow2}Spam protection triggered {white}for SID: {request.sid}", "S.ON chat_command")
        else:
            SHL.output(f"{yellow2}Spam protection triggered {white}for user: "
                       f"{socketio.server.environ[request.sid]['username']}", "S.ON chat_command")
        return

    user_limit.update_cooldown(request.sid)

    SHL.output(f"Received message {command}", "S.ON chat_message")

    try:
        display_name = str(command['display_name']).strip()
        command_body = str(command['message']).strip()
    except KeyError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_command")
        emit("error", "bad request")
        return
    except ValueError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_command")
        emit("error", "bad request")
        return

    if display_name.find('Server') == 0 or len(display_name) not in range(1, 100):  # only allow username with length 1-100
        SHL.output(f"{yellow2}Invalid username {display_name}{white}", "S.ON chat_message")
        emit('error', {"message": "invalid username"})
        return

    command_handler(system=System(), author=display_name, command_body=command_body)


@socketio.on('chat_message')
def handle_message(message):
    if user_limit.check_cooldown(request.sid):
        if logindisabled:
            SHL.output(f"{yellow2}Spam protection triggered {white}for SID: {request.sid}", "S.ON chat_message")
        else:
            SHL.output(f"{yellow2}Spam protection triggered {white}for user: "
                       f"{socketio.server.environ[request.sid]['username']}", "S.ON chat_message")
        return

    user_limit.update_cooldown(request.sid)

    SHL.output(f"Received message {message}", "S.ON chat_message")
    try:
        display_name = str(message['display_name']).strip()
        msg_body = str(message['message']).strip()
    except KeyError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_message")
        emit("error", "bad request")
        return
    except ValueError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_command")
        emit("error", "bad request")
        return

    # defaults
    username = display_name
    display_color = "#FF0000"
    timestamp = datetime.now().strftime("%H:%M:%S")
    avatar = "/public/img/emote1.PNG"

    if not logindisabled:
        SHL.output("Importing userconfig", "S.ON chat_message")
        try:
            if socketio.server.environ[request.sid]["userconfig"]["display_name"].strip() != "":
                username = socketio.server.environ[request.sid]["username"]
                display_name = socketio.server.environ[request.sid]["userconfig"]["display_name"]
                display_color = socketio.server.environ[request.sid]["userconfig"]["chat_color"]
                avatar = f"https://profile.zaanposni.com/pictures/{socketio.server.environ[request.sid]['username']}.png"
        except KeyError:
            SHL.output("Invalid userconfig", "S.ON chat_message")
            emit('error', {'message': 'invalid userconfig'})
            return

    if any(x in display_name for x in ["System", "Server"]) or len(display_name) not in range(1, 100):  # only allow username with length 1-100
        SHL.output(f"{yellow2}Invalid username {display_name}{white}", "S.ON chat_message")
        emit('error', {"message": "invalid username"})
        return

    if 0 < len(msg_body) < 5000:
        display_name = safe_tags_replace(display_name)
        msg_body = safe_tags_replace(msg_body)
        msg_body = link_replacer(msg_body)
        msg_body = safe_emote_replace(msg_body)
        msg_body = newlinehtmlregex.sub("<br />", msg_body)
        emit('chat_message',
             {
                 'timestamp': timestamp,
                 'display_name': display_name,
                 'username': username,
                 'user_color': display_color,
                 'avatar': avatar,
                 'message': msg_body
             }, broadcast=True)
    else:
        SHL.output(f"{yellow2}Invalid message length: {len(msg_body)}{white}", "S.ON chat_message")
        emit('error', {"message": "invalid message"})


@socketio.on('connect')
def connect(data=""):
    SHL.output(f"New connection with data: {data}", "S.ON Connect")
    if not logindisabled:
        SHL.output("Validating session for new connection.", "S.ON Connect")
        verify = verify_token(data)
        username = verify
        if not verify:
            SHL.output(f"{yellow2}Invalid session.{white}", "S.ON Connect")
            emit('error', {'message': 'invalid token'})
            return

        ip = socketio.server.environ[request.sid]["HTTP_CF_CONNECTING_IP"]
        SHL.output(f"IP: {ip}", "S.ON Connect")
        SHL.output(f"Username: {username}", "S.ON Connect")

        r = requests.get(f"https://profile.zaanposni.com/get/{username}.json",
                         headers={
                             'Cache-Control': 'no-cache',
                             'Authorization': f'Bearer {request.cookies.get("access_token", "")}'
                         })

        if r.status_code != 200:
            SHL.output(f"{yellow2}Error on receiving userconfig: {r.status_code}{white}", "S.ON Connect")
            emit('error', {'status_code': r.status_code, 'message': r.text})
            return

        SHL.output(f"User config: {r.json()}", "S.ON Connect")
        socketio.server.environ[request.sid]["username"] = username  # TODO: use user_manager
        socketio.server.environ[request.sid]["userconfig"] = r.json()

        user_manager.add(request.sid, username, r.json())
        emit('status', {'loginmode': True, 'username': username})
        SHL.output(f"{green2}Valid session.{white}", "S.ON Connect")
    else:
        emit('status', {'loginmode': False})
        user_manager.add(request.sid)
    emit_status({'count': user_manager.get_count()})


@socketio.on('disconnect')
def disconnect():
    SHL.output("User disconnected.", "S.ON Disconnect")
    user_manager.rem(request.sid)
    user_limit.remove_sid(request.sid)
    SHL.output(f"User count: {user_manager.count}.", "S.ON Disconnect")
    emit_status({'count': user_manager.get_count()})


def emit_status(status):
    socketio.emit('status', status)


tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
}


def replace_tag(tag):
    return tagsToReplace.get(tag, tag)


def safe_tags_replace(text):
    return re.sub(htmlregex, lambda x: replace_tag(x.group()), text, 0)


def replace_emote(emote):
    if emote in emotehandler.emotes:
        return emotehandler.emotes[emote]["replace"]
    else:
        return emote


def safe_emote_replace(text):
    return re.sub(emoteregex, lambda x: replace_emote(x.group()), text, 0)


def link_replacer(text):
    rawtext = text
    text = link_display(text)
    matches = linkregex.finditer(rawtext)
    for matchNum, match in enumerate(matches, start=0):
        replace = link_preview(match.group())
        if replace:
            text += replace + "<br />"
    return text


def link_display(text):
    return re.sub(linkregex, lambda x: change_link(x.group()), text, 0)


def change_link(text):
    if val_url(text):
        return f'<a target="_blank" rel="noopener noreferrer" href="{text}">{text}</a>'
    else:
        return text


def link_preview(text):
    if val_url(text):
        youtube_embeded = get_embed_youtube_code(text)
        image_embeded = get_embed_image_link(text)
        audio_embeded = get_embed_audio_link(text)
        video_embeded = get_embed_video_link(text)
        if youtube_embeded is not None:
            return f'<a target="_blank" rel="noopener noreferrer" href="{text}"/><br/>{youtube_embeded}'
        elif image_embeded is not None:
            return f'<a target="_blank" rel="noopener noreferrer" href="{text}"/><br/>{image_embeded}'
        elif audio_embeded is not None:
            return audio_embeded
        elif video_embeded is not None:
            return video_embeded
        else:
            return None
    else:
        return None


def get_embed_youtube_code(link):
    matches = youtuberegex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        return f'<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{match.group(1)}" ' \
               f'frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" ' \
               f'allowfullscreen></iframe>'
    return None


def get_embed_image_link(link):
    matches = imageregex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        return f'<img class="image-preview" src="{link}"/>'
    return None


def get_embed_video_link(link):
    matches = videoregex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        return f'<video class="video-embed" src="{link}" controls preload="metadata"/>'
    return None


def get_embed_audio_link(link):
    matches = audioregex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        return f'<br /><audio class="audio-embed" src="{link}" controls preload="metadata"/>'
    return None

