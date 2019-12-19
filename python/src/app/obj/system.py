from typing import Union

from flask_socketio import emit
from flask import request

from .system_message import SystemMessage
from .embed import Embed
from . import chat_history, user_manager
from utils import Console, red, white

SHL = Console("SystemMessenger")


class SystemMessenger:
    def __init__(self, display_name: str = None, append_allow: bool = True, save_in_history: bool = False):
        self.__display_name = display_name
        self.__append_allow = append_allow
        self.__save_in_history = save_in_history

    def send(self, message: Union[SystemMessage, str, Embed], **kwargs):
        if isinstance(message, str):
            message = SystemMessage(content=message)

        if kwargs.get("display_name", self.__display_name):
            message.change_display_name(kwargs.get("display_name", self.__display_name))
        if kwargs.get("append_allow", self.__append_allow) is not None:
            message.change_append_allow(kwargs.get("append_allow", self.__append_allow))

        username = kwargs.get("username", None)
        if username:
            send_to_sid = user_manager.get_sid(username)
        else:
            send_to_sid = [kwargs.get("sid", request.sid)]
            username = user_manager.configs[send_to_sid[0]]["user"].username

        try:
            for sid in send_to_sid:
                emit('chat_message', message.to_json(), broadcast=False, room=sid)
            chat_history.add_message(message, username=username)

        except RuntimeError:  # no connected clients
            if not kwargs.get("predict_error", True):
                SHL.output(f"{red}Something went wrong while sending your message {message}{white}")
            else:
                pass

    def broadcast(self, message: Union[SystemMessage, str, Embed], **kwargs):
        if isinstance(message, str):
            message = SystemMessage(content=message)

        if kwargs.get("display_name", self.__display_name):
            message.change_display_name(kwargs.get("display_name", self.__display_name))
        if kwargs.get("append_allow", self.__append_allow) is not None:
            message.change_append_allow(kwargs.get("append_allow", self.__append_allow))
        chat_history.add_message(message, username="all")

        try:
            emit('chat_message', message.to_json(), broadcast=True)
        except RuntimeError:  # no connected clients
            if not kwargs.get("predict_error", True):
                SHL.output(f"{red}Something went wrong while sending your message {message}{white}")
            else:
                pass

    def change_display_name(self, new: str):
        self.__display_name = new

    def send_error(self, error: str, additional_dict: dict = dict(), **kwargs):
        try:
            emit('error', {**additional_dict, **{'message': error}})
        except RuntimeError:
            if not kwargs.get("predict_error", True):
                SHL.output(f"{red}Something went wrong while sending your error {error}{white}")
            else:
                pass
