from typing import Union

from .message import Message
from .embed import Embed
from utils import cfg


class ChatHistory:
    def __init__(self):
        self.__history = []
        self.__max_length = cfg.get("chat_history_length", 100)

    def add_message(self, msg: Union[Message, Embed]):
        if cfg.get("save_chat_history", True):
            self.__history.append(msg)
            if len(self.__history) > self.__max_length:
                self.__history.pop(0)

    def to_json(self) -> list:
        return [x.to_json() for x in self.__history]

    def get_messages(self):
        return self.__history


chat_history = ChatHistory()
