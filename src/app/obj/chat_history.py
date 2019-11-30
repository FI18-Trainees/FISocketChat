from typing import Union

from .message import Message
from .embed import Embed
from utils import cfg


class HistoryEntry:
    def __init__(self, obj: Union[Message, Embed], username):
        self.obj = obj
        self.username = username

    def to_json(self) -> dict:
        return self.obj.to_json()

    def __str__(self):
        return f"To: {self.username}, Msg: {self.obj}"


class ChatHistory:
    def __init__(self):
        self.__history = []
        self.__max_length = cfg.get("chat_history_length", 100)

    def add_message(self, msg: Union[Message, Embed], username: str = "all"):
        if cfg.get("save_chat_history", True):
            self.__history.append(HistoryEntry(msg, username))
            if len(self.__history) > self.__max_length:
                self.__history.pop(0)

    def to_json(self, username: str = "all") -> list:
        return [x.to_json() for x in self.__history if x.username in [username, "all"]]

    def get_messages(self, username: str = "all"):
        return [x for x in self.__history if x.username in [username, "all"]]

    def test(self):
        return self.__history


chat_history = ChatHistory()
