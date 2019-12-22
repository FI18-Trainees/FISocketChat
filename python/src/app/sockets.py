# -*- coding: utf-8 -*-
import requests
import re

from flask_socketio import emit
from validators import url as val_url
from flask_socketio import SocketIO
from flask import request

from utils import Console, yellow2, white, green2, cfg
from .obj import User, Command, Message, get_default_user, user_manager, user_limiter, chat_history
from .flask_app import app
from .authentication import verify_token
from .commands import handle_command as command_handler
from .emotes import emote_handler
from .chat_regex import *
from .chat_utils import announcer
from .runtime_settings import login_disabled

SHL = Console("Socket")

socketio = SocketIO(app, logger=True, engineio_logger=True, cors_allowed_origins="*")


@socketio.on('chat_command')
def handle_command(command):
    if user_limiter.check_cooldown(request.sid):
        if login_disabled:
            SHL.output(f"{yellow2}Spam protection triggered {white}for SID: {request.sid}", "S.ON chat_command")
        else:
            SHL.output(f"{yellow2}Spam protection triggered {white}for user: "
                       f"{user_manager.configs[request.sid]['user'].username}", "S.ON chat_command")
        return
    user_limiter.update_cooldown(request.sid)
    SHL.output(f"Received message {command}", "S.ON chat_message")

    try:
        cmd = Command(author=get_default_user(), content=str(command['message']).strip(), system=False)
        cmd.author.display_name = str(command['display_name']).strip()
        cmd.author.username = cmd.author.display_name
    except KeyError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_command")
        emit("error", "bad request")
        return
    except ValueError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_command")
        emit("error", "bad request")
        return

    if not login_disabled:
        SHL.output("Importing userconfig", "S.ON chat_message")
        try:
            cmd.author = user_manager.configs[request.sid]["user"]
        except KeyError:
            SHL.output("Invalid userconfig", "S.ON chat_command")
            emit('error', {'message': 'invalid userconfig'})
            return
        except AttributeError:
            SHL.output("Invalid userconfig", "S.ON chat_command")
            emit('error', {'message': 'invalid userconfig'})
            return

    if cmd.author.display_name.find('Server') == 0 or len(cmd.author.display_name) not in range(1, 100):  # only allow username with length 1-100
        SHL.output(f"{yellow2}Invalid username {cmd.author.display_name}{white}", "S.ON chat_message")
        emit('error', {"message": "invalid username"})
        return

    command_handler(author=cmd.author, command=cmd)


@socketio.on('chat_message')
def handle_message(message):
    if user_limiter.check_cooldown(request.sid):
        if login_disabled:
            SHL.output(f"{yellow2}Spam protection triggered {white}for SID: {request.sid}", "S.ON chat_message")
        else:
            SHL.output(f"{yellow2}Spam protection triggered {white}for user: "
                       f"{user_manager.configs[request.sid]['user'].username}", "S.ON chat_message")
        return
    user_limiter.update_cooldown(request.sid)
    SHL.output(f"Received message {message}", "S.ON chat_message")

    try:
        msg = Message(author=get_default_user(), content=str(message['message']).strip(), system=False)
        msg.author.display_name = str(message['display_name']).strip()
        msg.author.username = msg.author.display_name
    except KeyError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_message")
        emit("error", "bad request")
        return
    except ValueError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_command")
        emit("error", "bad request")
        return

    if not login_disabled:
        SHL.output("Importing userconfig", "S.ON chat_message")
        try:
            msg.author = user_manager.configs[request.sid]["user"]
        except KeyError:
            SHL.output("Invalid userconfig", "S.ON chat_message")
            emit('error', {'message': 'invalid userconfig'})
            return
        except AttributeError:
            SHL.output("Invalid userconfig", "S.ON chat_message")
            emit('error', {'message': 'invalid userconfig'})
            return

    if any(x in msg.author.display_name for x in ["System", "Server"]) or len(msg.author.display_name) not in range(1, 100):  # only allow username with length 1-100
        SHL.output(f"{yellow2}Invalid username {msg.author.display_name}{white}", "S.ON chat_message")
        emit('error', {"message": "invalid username"})
        return

    if 0 < len(msg.content) < 2000:
        msg.author.display_name = safe_tags_replace(msg.author.display_name)
        msg.apply_func((safe_tags_replace, link_replacer, safe_emote_replace, quote_replacer,
                        replace_newline, codeblock_replacer))

        chat_history.add_message(msg=msg)  # log
        emit('chat_message', msg.to_json(), broadcast=True)
    else:
        SHL.output(f"{yellow2}Invalid message length: {len(msg.content)}{white}", "S.ON chat_message")
        emit('error', {"message": "invalid message"})


@socketio.on('connect')
def connect(data=""):
    SHL.output(f"New connection with data: {data}", "S.ON Connect")
    new_user = User(display_name="Shawn", username="Shawn")
    if not login_disabled:
        SHL.output("Validating session for new connection.", "S.ON Connect")
        new_user.username = verify_token(data)
        if not new_user.username:
            SHL.output(f"{yellow2}Invalid session.{white}", "S.ON Connect")
            emit('error', {'message': 'invalid token'})
            return
        
        try:
            ip = socketio.server.environ[request.sid]["HTTP_CF_CONNECTING_IP"]
        except KeyError:
            SHL.output("Invalid network setup", "S.ON Connect")
            emit('error', {'message': 'Invalid network setup'})
            return

        SHL.output(f"IP: {ip}", "S.ON Connect")
        SHL.output(f"Username: {new_user.username}", "S.ON Connect")

        r = requests.get(f"https://profile.zaanposni.com/get/{new_user.username}.json",
                         headers={
                             'Cache-Control': 'no-cache',
                             'Authorization': f'Bearer {request.cookies.get("access_token", "")}'
                         })

        if r.status_code != 200:
            SHL.output(f"{yellow2}Error on receiving userconfig: {r.status_code}{white}", "S.ON Connect")
            if "cloudflare" in r.text.lower():
                emit('error', {'status_code': r.status_code, 'message': "authentication service offline"})
                return
            emit('error', {'status_code': r.status_code, 'message': "failed authorization"})
            return
        SHL.output(f"User config: {r.json()}", "S.ON Connect")

        try:
            config = r.json()
            if config["display_name"].strip() != "":
                new_user.display_name = config["display_name"]
                new_user.chat_color = config["chat_color"]
                new_user.avatar = f"https://profile.zaanposni.com/pictures/{new_user.username}.png"
        except KeyError:
            SHL.output("Invalid userconfig", "S.ON Connect")
            emit('error', {'message': 'invalid userconfig'})
            return
        except AttributeError:
            SHL.output("Invalid userconfig", "S.ON Connect")
            emit('error', {'message': 'invalid userconfig'})
            return

        emit('status', {'loginmode': True, 'username': new_user.username, 'chat_color': new_user.chat_color})
        if cfg.get("enable_connect_announcement", False):
            announcer.broadcast(f"{new_user.username} connected.")
        SHL.output(f"{green2}Valid session.{white}", "S.ON Connect")
    else:
        emit('status', {'loginmode': False})

    user_manager.add(sid=request.sid, user=new_user)
    SHL.output(f"User count: {user_manager.get_count()}.", "S.ON Connect")
    emit_status({'count': user_manager.get_count()})
    emit('status', {'on_ready': True})


@socketio.on('disconnect')
def disconnect():
    SHL.output("User disconnected.", "S.ON Disconnect")
    user_manager.rem(request.sid)
    user_limiter.remove_sid(request.sid)
    SHL.output(f"User count: {user_manager.get_count()}.", "S.ON Disconnect")
    emit_status({'count': user_manager.get_count()})


def emit_status(status: dict):
    socketio.emit('status', status)


tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
}


def replace_newline(text: str, replace="<br />") -> str:
    return newline_html_regex.sub(replace, text)


def replace_tag(tag: str) -> str:
    return tagsToReplace.get(tag, tag)


def safe_tags_replace(text: str) -> str:
    return re.sub(html_regex, lambda x: replace_tag(x.group()), text, 0)


def replace_emote(emote: str) -> str:
    if emote in emote_handler.emotes:
        return emote_handler.emotes[emote]["replace"]
    return emote


def safe_emote_replace(text: str) -> str:
    return re.sub(emote_regex, lambda x: replace_emote(x.group()), text, 0)


def link_replacer(text: str) -> str:
    rawtext = text
    text = link_display(text)
    matches = link_regex.finditer(rawtext)
    for matchNum, match in enumerate(matches, start=0):
        replace = link_preview(match.group())
        if replace:
            text += replace + "<br />"
    return text


def link_display(text: str) -> str:
    return re.sub(link_regex, lambda x: change_link(x.group()), text, 0)


def change_link(text: str) -> str:
    if val_url(text):
        return f'<a target="_blank" rel="noopener noreferrer" href="{text}">{text}</a>'
    return text


def link_preview(text: str) -> str:
    if val_url(text):
        for func in [get_embed_image_link, get_embed_video_link, get_embed_audio_link, get_embed_youtube_code]:
            result = func(text)
            if result:
                return result
    return ""


def get_embed_youtube_code(link: str) -> str:
    matches = youtube_regex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        if match.group(2) is not None:
            return f'<a target="_blank" rel="noopener noreferrer" href="{link}"/><br/>' \
                   f'<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{match.group(1)}?start={match.group(2)}" ' \
                   f'frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" ' \
                   f'allowfullscreen></iframe>'
        return f'<a target="_blank" rel="noopener noreferrer" href="{link}"/><br/>' \
               f'<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{match.group(1)}" ' \
               f'frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" ' \
               f'allowfullscreen></iframe>'
    return ""


def get_embed_image_link(link: str) -> str:
    matches = image_regex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        return f'<a target="_blank" rel="noopener noreferrer" href="{link}"/><br/><img class="image-preview" src="{match.group()}" onload="updateScroll();"/>'
    matches = special_image_regex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        return f'<br /><img class="image-preview" src="{link.replace(match.group(), ".gif")}" onload="updateScroll();"/>'
    return ""


def get_embed_video_link(link: str) -> str:
    matches = video_regex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        return f'<br /><video class="video-embed" src="{match.group()}" controls preload="metadata" onloadedmetadata="updateScroll();"/>'
    return ""


def get_embed_audio_link(link: str) -> str:
    matches = audio_regex.finditer(link)
    for matchNum, match in enumerate(matches, start=1):
        return f'<br /><audio class="audio-embed" src="{match.group()}" controls preload="metadata"/>'
    return ""


def codeblock_replacer(text: str) -> str:
    codereplace = re.sub(code_regex, '<em class="code my-1 w-100 px-1 border-left border-right border-left-rounded">\g<2></em>', text, 0)
    codereplace = re.sub(r"\t", "&nbsp;&nbsp;&nbsp;&nbsp;", codereplace, 0, re.MULTILINE)
    return re.sub(r" {4}", "&nbsp;&nbsp;&nbsp;&nbsp;", codereplace, 0, re.MULTILINE)


def quote_replacer(text: str) -> str:
    return re.sub(quote_regex, '<em class="quote font-weight-light pl-3">\g<1></em>', text, 0)
