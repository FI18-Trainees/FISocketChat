from datetime import datetime
from collections import Callable

from . import User


class Message:
    def __init__(self, author: User, msg_body: str, system: bool):
        self.author = author
        self.msg_body = msg_body
        self.system = system
        self.full_timestamp = datetime.now()
        self.timestamp = self.full_timestamp.strftime("%H:%M:%S")

    def to_json(self) -> dict:
        return {
            "author": self.author.to_json(),
            "msg_body": self.msg_body,
            "system": self.system,
            "full_timestamp":  self.full_timestamp,
            "timestamp": self.timestamp
        }

    def apply_func(self, funcs: tuple):
        for x in funcs:
            if isinstance(x, Callable):
                new = x(self.msg_body)
                if new:
                    self.msg_body = new
