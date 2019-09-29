# -*- coding: utf-8 -*-
from . import socketio, emotehandler, emoteregex, htmlregex, linkregex, youtuberegex, user_count, verify_token, \
    logindisabled, others
from .shell import *
from flask_socketio import emit
import re
from validators import url as valUrl
from datetime import datetime
from flask import request
import requests
SHL = Console("Init")
others.new_emotes = False


@socketio.on('chat_message')
def handle_message(message):
    SHL.output(f"Received message {message}", "S.ON chat_message")
    timestamp = datetime.now().strftime("%H:%M:%S")
    try:
        user = message['display_name'].strip()
        msg = message['message'].strip()
    except KeyError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_message")
        emit("error", "bad request")
        return
    color = "#FF0000"

    if not logindisabled:
        SHL.output("Importing userconfig", "S.ON chat_message")
        try:
            if socketio.server.environ[request.sid]["userconfig"]["display_name"].strip() != "":
                user = socketio.server.environ[request.sid]["userconfig"]["display_name"]
                color = socketio.server.environ[request.sid]["userconfig"]["chat_color"]
        except KeyError:
            SHL.output("Invalid userconfig", "S.ON chat_message")
            emit('error', {'message': 'invalid userconfig'})
            return

    if user.find('Server') == 0 or len(user) not in range(1, 100):  # only allow username with length 1-100
        SHL.output(f"{yellow2}Invalid username {user}{white}", "S.ON chat_message")
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
        SHL.output(f"{yellow2}Invalid message length: {len(msg)}{white}", "S.ON chat_message")
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
        socketio.server.environ[request.sid]["userconfig"] = r.json()
        SHL.output(f"{green2}Valid session.{white}", "S.ON Connect")
    user_count.add()
    emit_status({'count': user_count.get_count()})


@socketio.on('disconnect')
def disconnect():
    SHL.output("User disconnected.", "S.ON Disconnect")
    user_count.rem()
    SHL.output(f"User count: {user_count.count}.", "S.ON Disconnect")
    emit_status({'count': user_count.get_count()})


@socketio.on('checkNewEmote')
def check_emote():
    SHL.output(f"Checking for new emotes: {others.new_emotes}.", "S.ON checkNewEmote")
    if others.new_emotes:
        emit_status({"newemote": 1})


def emit_status(status):
    socketio.emit('status', status, broacast=True)


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
    return re.sub(linkregex, lambda x: link_wrapping(x.group()), text, 0)


def link_wrapping(text):
    if valUrl(text):
        youtube_embeded = get_embed_youtube_code(text)
        if youtube_embeded is not None:
            return f'<a target="_blank" rel="noopener noreferrer" href="{text}">{text}</a> <br>{youtube_embeded}'
        else:
            return f'<a target="_blank" rel="noopener noreferrer" href="{text}">{text}</a>'
    else:
        return text


def set_new_emote():
    others.new_emotes = True


def get_embed_youtube_code(link):
    matches = youtuberegex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        template = """<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{videoID}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>"""
        return template.format(videoID=match.group(1))
    return None
