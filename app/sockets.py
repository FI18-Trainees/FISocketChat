from app import app, socketio, emotehandler
from flask_socketio import send, emit
import re


@socketio.on('chat_message')
def handle_message(message):
    msg = message[(message.find(';')+1):]
    usr = message[:(message.find(';')+1)]
    if msg.find('Server') == 0 or msg.find(':') > 100:
        msg = msg[msg.find(':'):]
        msg = '{Invalid username}' + msg

    if len(msg[(msg.find(':')+1):].strip()) > 0:
        msg = safe_tags_replace(msg)
        msg = safe_emote_replace(msg)
        emit('chat_message', usr + msg, broadcast=True)


count = 0
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
    return emotehandler.emotes.get(emote, emote)


def safe_emote_replace(text):
    return re.sub(r"[\"'\/]?[\/:\w]+[\"'\/]?", lambda x: replaceEmote(x.group()), text, 0, re.MULTILINE)
