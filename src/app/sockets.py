# -*- coding: utf-8 -*-
from . import socketio, emotehandler
from flask_socketio import emit
import re
from validators import url as valUrl
from datetime import datetime

newemote = False


@socketio.on('chat_message')
def handle_message(message):
    timestamp = datetime.now().strftime("%H:%M:%S")
    user = message['user'].strip()
    message = message['message'].strip()

    if user.find('Server') == 0 or len(user) > 100:  # only allow usernames with length 1-100
        user = '{Invalid username}'

    if len(message) > 0:
        message = safe_tags_replace(message)
        message = link_replacer(message)
        message = safe_emote_replace(message)
        emit('chat_message', {'timestamp': timestamp, 'user': user, 'message': message}, broadcast=True)


count = 0  # TODO: add a class for this so we dont need globals monkaS
@socketio.on('connect')
def connect():
    global count
    count += 1
    emit('status', {'count': count}, broadcast=True)


@socketio.on('disconnect')
def disconnect():
    global count
    count -= 1
    emit('status', {'count': count}, broadcast=True)


@socketio.on('checkEmotes')
def emotecheck():
    if newemote:
        emit('status', {'emoteupdated': 1}, broadcast=True)


tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
}


def replaceTag(tag):
    return tagsToReplace.get(tag, tag)


def safe_tags_replace(text):
    return re.sub(r"[&<>]", lambda x: replaceTag(x.group()), text, 0, re.MULTILINE)


def replaceEmote(emote):
    if emote in emotehandler.emotes:
        return emotehandler.emotes[emote]["replace"]
    else:
        return emote


def safe_emote_replace(text):
    return re.sub(r"[\"'/]?[/?!:\w]+[\"'/]?", lambda x: replaceEmote(x.group()), text, 0, re.MULTILINE)


def link_replacer(text):
    return re.sub(r"[A-Za-z0-9\-._~:/?#\[\]@!$%()*+,;=]+", lambda x: linkwrapping(x.group()), text, 0, re.MULTILINE)


def linkwrapping(text):
    res = valUrl(text)
    # print(res)
    if res:
        return "<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"" + text + "\">" + text + "</a>"
    else:
        return text



