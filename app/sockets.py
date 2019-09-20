from app import app, socketio, emotehandler
from flask_socketio import send, emit
import re
from validators import url as valUrl

newemote = False

@socketio.on('chat_message')
def handle_message(message):
    msg = message[(message.find(';')+1):]
    usr = message[:(message.find(';')+1)]
    if msg.find('Server') == 0 or msg.find(':') > 100:  # only allow usernames with length 1-100
        msg = msg[msg.find(':'):]
        msg = '{Invalid username}' + msg

    if msg[(msg.find(':')+1):].strip():
        msg = safe_tags_replace(msg)
        prefix = msg[:msg.find(": ")+2]
        possiblelink = str.strip(msg[msg.find(": ")+2:])
        msg = prefix + link_replacer(possiblelink)
        msg = safe_emote_replace(msg)
        emit('chat_message', usr + msg, broadcast=True)


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
    return re.sub(r"[\"'\/]?[\/\?:\w]+[\"'\/]?", lambda x: replaceEmote(x.group()), text, 0, re.MULTILINE)


def link_replacer(text):
    return re.sub(r"[:/.?!=_#\-\w]+", lambda x: linkwrapping(x.group()), text, 0, re.MULTILINE)


def linkwrapping(text):
    res = valUrl(text)
    # print(res)
    if res:
        return "<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"" + text + "\">" + text + "</a>"
    else:
        return text



