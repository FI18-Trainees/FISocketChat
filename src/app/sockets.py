# -*- coding: utf-8 -*-
from . import socketio, emotehandler, emoteregex, htmlregex, linkregex, youtuberegex, user_count
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

    if user.find('Server') == 0 or len(user) not in range(1, 100):  # only allow usernames with length 1-100
        user = '{Invalid username}'
        emit('error', {"timestamp": timestamp, "message": "invalid username"})
        return

    if 0 < len(message) < 5000:
        message = safe_tags_replace(message)
        user = safe_tags_replace(user)
        message = link_replacer(message)
        message = safe_emote_replace(message)
        emit('chat_message', {'timestamp': timestamp, 'user': user, 'message': message}, broadcast=True)
    else:
        emit('error', {"timestamp": timestamp, "message": "invalid message"})


@socketio.on('connect')
def connect():
    user_count.add()
    emitstatus({'count': user_count.get_count()})


@socketio.on('disconnect')
def disconnect():
    user_count.rem()
    emitstatus({'count': user_count.get_count()})


@socketio.on('checkNewEmote')
def checkEmote():
    global newemote
    if newemote:
        emitstatus({"newemote": 1})


def emitstatus(status):
    socketio.emit('status', status)


tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
}


def replaceTag(tag):
    return tagsToReplace.get(tag, tag)


def safe_tags_replace(text):
    return re.sub(htmlregex, lambda x: replaceTag(x.group()), text, 0)


def replaceEmote(emote):
    if emote in emotehandler.emotes:
        return emotehandler.emotes[emote]["replace"]
    else:
        return emote


def safe_emote_replace(text):
    return re.sub(emoteregex, lambda x: replaceEmote(x.group()), text, 0)


def link_replacer(text):
    return re.sub(linkregex, lambda x: linkwrapping(x.group()), text, 0)


def linkwrapping(text):
    res = valUrl(text)
    if res:
        youtubeembedded = getembeddyoutubecode(text)
        if youtubeembedded is not None:
            return "<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"" + text + "\">" + text + "</a> <br>" + youtubeembedded
        else:
            return "<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"" + text + "\">" + text + "</a>"
    else:
        return text


def setNewEmote():
    global newemote
    newemote = True


def getembeddyoutubecode(link):
    matches = youtuberegex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        template = """<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{videoID}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>"""
        return template.format(videoID=match.group(1))
    return None
