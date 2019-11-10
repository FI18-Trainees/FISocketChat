from typing import Union

from flask_socketio import emit

from . import SystemMessage


class SystemMessenger:
    @staticmethod
    def send(message: Union[SystemMessage, str]):
        if isinstance(message, str):
            message = SystemMessage(msg_body=message)
        emit('chat_message', message.to_json())

    @staticmethod
    def broadcast(message: Union[SystemMessage, str]):
        if isinstance(message, str):
            message = SystemMessage(msg_body=message)
        emit('chat_message', message.to_json(), broadcast=True)


system = SystemMessenger()
