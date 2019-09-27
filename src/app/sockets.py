# -*- coding: utf-8 -*-
from . import socketio, emotehandler, emoteregex, htmlregex, linkregex, youtuberegex, user_count, verify_token, \
    logindisabled
from flask_socketio import emit
import re
from validators import url as valUrl
from datetime import datetime
from flask import request
import requests

newemote = False


@socketio.on('chat_message')
def handle_message(message):
    print(message)
    timestamp = datetime.now().strftime("%H:%M:%S")
    user = message['user'].strip()
    color = "#FF0000"
    msg = message['message'].strip()

    if not logindisabled:
        print("Validating session for new connection.")
        try:
            if socketio.server.environ[request.sid]["userconfig"]["display_name"].strip() != "":
                user = socketio.server.environ[request.sid]["userconfig"]["display_name"]
                color = socketio.server.environ[request.sid]["userconfig"]["chat_color"]
        except KeyError:
            emit('error', {'message': 'invalid userconfig'})
            return

    if user.find('Server') == 0 or len(user) not in range(1, 100):  # only allow usernames with length 1-100
        user = '{Invalid username}'
        emit('error', {"timestamp": timestamp, "message": "invalid username"})
        return

    if 0 < len(msg) < 5000:
        msg = safe_tags_replace(msg)
        user = safe_tags_replace(user)
        msg = link_replacer(msg)
        msg = safe_emote_replace(msg)
        emit('chat_message',
             {
                 'timestamp': timestamp,
                 'display_name': user,
                 'message': msg,
                 'user_color': color
             }, broadcast=True)
    else:
        emit('error', {"timestamp": timestamp, "message": "invalid message"})


@socketio.on('connect')
def connect(data=""):
    if not logindisabled:
        print("Validating session for new connection.")
        if not verify_token(data):
            print("Invalid session.")
            emit('error', {'message': 'invalid token'})
            return
        ip = socketio.server.environ[request.sid]["HTTP_CF_CONNECTING_IP"]
        r = requests.get("https://auth.zaanposni.com/username",
                         headers={
                             'Cache-Control': 'no-cache',
                             'X-Auth-For': ip,
                             'Authorization': f'Bearer {request.cookies.get("access_token", "")}'
                         })
        if r.status_code != 200:
            emit('error', {'status_code': r.status_code, 'message': 'invalid token'})
            return
        print(f"Username: {r.text}")
        r = requests.get(f"https://profile.zaanposni.com/get/{r.text}.json",
                         headers={
                             'Cache-Control': 'no-cache',
                             'Authorization': f'Bearer {request.cookies.get("access_token", "")}'
                         })
        if r.status_code != 200:
            emit('error', {'status_code': r.status_code, 'message': r.text})
            return
        print(f"User config: {r.json()}")
        socketio.server.environ[request.sid]["userconfig"] = r.json()
        print("Valid session.")
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
