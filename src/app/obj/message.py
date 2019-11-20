from datetime import datetime
from collections import Callable

from .user import User


class Message:
    __content_type = "message"

    def __init__(self, author: User, msg_body: str, system: bool):
        self.author = author
        self.msg_body = msg_body
        self.system = system
        self.full_timestamp = datetime.now()
        self.timestamp = self.full_timestamp.strftime("%H:%M:%S")

    def to_json(self) -> dict:
        return {
            "content_type": self.__content_type,
            "author": self.author.to_json(),
            "msg_body": self.msg_body,
            "system": self.system,
            "full_timestamp":  str(self.full_timestamp),
            "timestamp": str(self.timestamp)
        }

    def apply_func(self, funcs: tuple):
        for x in funcs:
            if isinstance(x, Callable):
                new = x(self.msg_body)
                if new:
                    self.msg_body = new

    def __str__(self):
        return f"[{self.timestamp}] {self.author}: {self.msg_body}"
