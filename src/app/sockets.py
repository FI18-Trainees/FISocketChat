# -*- coding: utf-8 -*-
import requests
import re

from flask_socketio import emit
from validators import url as val_url

from app import socketio, emote_handler,  user_manager, \
    emote_regex, html_regex, newline_html_regex, link_regex, youtube_regex, image_regex, video_regex, audio_regex, \
    code_regex, quote_regex, special_image_regex, request, user_limiter, chat_history, announcer
from app import handle_command as command_handler
from app.obj import User, Command, Message, get_default_user
from utils import Console, yellow2, white, green2, cfg

SHL = Console("Socket")


@socketio.on('chat_command')
def handle_command(command):
    if user_limiter.check_cooldown(request.sid):
        SHL.output(f"{yellow2}Spam protection triggered {white}for SID: {request.sid}", "S.ON chat_command")
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

    if cmd.author.display_name.find('Server') == 0 or len(cmd.author.display_name) not in range(1, 100):  # only allow username with length 1-100
        SHL.output(f"{yellow2}Invalid username {cmd.author.display_name}{white}", "S.ON chat_message")
        emit('error', {"message": "invalid username"})
        return

    command_handler(author=cmd.author, command=cmd)


@socketio.on('chat_message')
def handle_message(message):
    if user_limiter.check_cooldown(request.sid):
        SHL.output(f"{yellow2}Spam protection triggered {white}for SID: {request.sid}", "S.ON chat_message")
        return
    user_limiter.update_cooldown(request.sid)
    SHL.output(f"Received message {message}", "S.ON chat_message")

    try:
        msg = Message(author=get_default_user(), content=str(message['message']).strip(), system=False)
        msg.author.display_name = str(message['display_name']).strip()
        msg.author.username = msg.author.display_name
        msg.author.avatar = f"/public/img/{msg.author.display_name}.png"
        msg.author.chat_color = str(message['display_name']).strip()
    except KeyError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_message")
        emit("error", "bad request")
        return
    except ValueError:
        SHL.output(f"{yellow2}Bad request.{white}", "S.ON chat_command")
        emit("error", "bad request")
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
