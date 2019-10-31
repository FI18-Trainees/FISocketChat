# -*- coding: utf-8 -*-
from . import socketio, emotehandler, emoteregex, htmlregex, linkregex, youtuberegex, user_count, verify_token, \
    logindisabled, others, imageregex, request
from .shell import *
from flask_socketio import emit
import re, time
from validators import url as val_url
from datetime import datetime
import requests
SHL = Console("Init")
others.new_emotes = False
userdict = {}

@socketio.on('chat_message')
def handle_message(message):
    if request.sid in userdict:
        if float(time.time() - userdict[request.sid]) <= 0.7:
            SHL.output(f"{yellow2}Spam protection triggered {white}for SID: {request.sid}", "S.ON chat_message")
            return

    userdict[request.sid] = time.time()
    SHL.output(f"Received message {message}", "S.ON chat_message")
    try:
        display_name = message['display_name'].strip()
        msg_body = message['message'].strip()
    except KeyError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_message")
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

    if display_name.find('Server') == 0 or len(display_name) not in range(1, 100):  # only allow username with length 1-100
        SHL.output(f"{yellow2}Invalid username {display_name}{white}", "S.ON chat_message")
        emit('error', {"timestamp": timestamp, "message": "invalid username"})
        return

    if 0 < len(msg_body) < 5000:
        display_name = safe_tags_replace(display_name)
        msg_body = safe_tags_replace(msg_body)
        msg_body = link_replacer(msg_body)
        msg_body = safe_emote_replace(msg_body)
        regex = re.compile(r'[\n\r\t]')
        msg_body = regex.sub("<br />", msg_body)

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
        emit('error', {"timestamp": timestamp, "message": "invalid message"})


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
        socketio.server.environ[request.sid]["username"] = username
        socketio.server.environ[request.sid]["userconfig"] = r.json()
        emit('status', {'loginmode': True, 'username': username})
        SHL.output(f"{green2}Valid session.{white}", "S.ON Connect")
    else:
        emit('status', {'loginmode': False})
    user_count.add()
    emit_status({'count': user_count.get_count()})


@socketio.on('disconnect')
def disconnect():
    userdict.pop(request.sid)
    SHL.output("User disconnected.", "S.ON Disconnect")
    user_count.rem()
    SHL.output(f"User count: {user_count.count}.", "S.ON Disconnect")
    emit_status({'count': user_count.get_count()})


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
    text = link_display(text)
    links = re.findall(linkregex, text)
    for link in set(links):
        replace = link_preview(link)
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
        if youtube_embeded is not None:
            return f'<a target="_blank" rel="noopener noreferrer" href="{text}"/><br/>{youtube_embeded}'
        elif image_embeded is not None:
            return f'<a target="_blank" rel="noopener noreferrer" href="{text}"/><br/>{image_embeded}'
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
