from .message import Message
from utils import cfg


class ChatHistory:
    def __init__(self):
        self.__history = []
        self.__max_length = cfg.options.get("chat_history_length", 100)

    def add_message(self, msg: Message):
        if cfg.options.get("save_chat_history", True):
            self.__history.append(msg)
            if len(self.__history) > self.__max_length:
                self.__history.pop(0)

    def to_json(self) -> list:
        return [x.to_json() for x in self.__history]

    def get_messages(self):
        return self.__history
