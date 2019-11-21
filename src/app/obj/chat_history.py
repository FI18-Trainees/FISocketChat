from .message import Message


class ChatHistory:
    def __init__(self):
        self.__history = []
        self.__max_length = 100

    def add_message(self, msg: Message):
        self.__history.append(msg)
        if len(self.__history) > self.__max_length:
            self.__history.pop(0)

    def to_json(self) -> list:
        return [x.to_json() for x in self.__history]

    def get_messages(self):
        return self.__history
