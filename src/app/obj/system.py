from typing import Union

from flask_socketio import emit

from .system_message import SystemMessage
from .embed import Embed
from . import chat_history
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

        if kwargs.get("save_in_history", self.__save_in_history):
            chat_history.add_message(message)

        try:
            emit('chat_message', message.to_json(), broadcast=False)
        except RuntimeError:  # no connected clients
            SHL.output(f"{red}Something went wrong while sending your message {message}{white}")

    def broadcast(self, message: Union[SystemMessage, str, Embed], **kwargs):
        if isinstance(message, str):
            message = SystemMessage(content=message)
            if kwargs.get("display_name", self.__display_name):
                message.change_display_name(kwargs.get("display_name", self.__display_name))
            if kwargs.get("append_allow", self.__append_allow) is not None:
                message.change_append_allow(kwargs.get("append_allow", self.__append_allow))

        if kwargs.get("save_in_history", self.__save_in_history):
            chat_history.add_message(message)

        try:
            emit('chat_message', message.to_json(), broadcast=True)
        except RuntimeError:  # no connected clients
            SHL.output(f"{red}Something went wrong while sending your message {message}{white}")

    def change_display_name(self, new: str):
        self.__display_name = new

    def send_error(self, error: str, additional_dict: dict = dict()):
        emit('error', {**additional_dict, **{'message': error}})
