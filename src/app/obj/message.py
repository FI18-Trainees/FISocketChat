from datetime import datetime
from collections import Callable

from . import User


class Message:
    def __init__(self, author: User, msg_body: str, system: bool):
        self.author = author
        self.msg_body = msg_body
        self.system = system
        self.timestamp = datetime.now()
        self.format_timestamp = self.timestamp.strftime("%H:%M:%S")

    def to_json(self) -> dict:
        return

    def apply_func(self, funcs: tuple):
        for x in funcs:
            if isinstance(x, Callable):
                new = x(self.msg_body)
                if new:
                    self.msg_body = new
