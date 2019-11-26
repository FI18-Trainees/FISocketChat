from typing import Union

from flask_socketio import emit

from .system_message import SystemMessage
from .embed import Embed


class SystemMessenger:
    def __init__(self, display_name: str = None):
        self.display_name = display_name

    def send(self, message: Union[SystemMessage, str, Embed]):
        if isinstance(message, str):
            message = SystemMessage(content=message)
        if self.display_name:
            message.change_display_name(self.display_name)

        emit('chat_message', message.to_json())

    def broadcast(self, message: Union[SystemMessage, str, Embed]):
        if isinstance(message, str):
            message = SystemMessage(content=message)
        if self.display_name:
            message.change_display_name(self.display_name)

        emit('chat_message', message.to_json(), broadcast=True)

    def change_display_name(self, new: str):
        self.display_name = new

    def send_error(self, error: str, additional_dict: dict = dict()):
        emit('error', {**additional_dict, **{'message': error}})
