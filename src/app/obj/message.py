from datetime import datetime
from collections import Callable

from aenum import Enum

from .user import User


prio_types = Enum("prio_types", "low default high critical")


class Message:
    __content_type = "message"

    def __init__(self, author: User, content: str, system: bool, append_allow: bool = True,
                 priority: prio_types = prio_types.default):
        self.author = author
        self.content = content
        self.system = system
        self.full_timestamp = datetime.now()
        self.timestamp = self.full_timestamp.strftime("%H:%M:%S")
        self.append_allow = append_allow
        self.priority = priority

    def to_json(self) -> dict:
        return {
            "content_type": self.__content_type,
            "author": self.author.to_json(),
            "content": self.content,
            "system": self.system,
            "full_timestamp":  str(self.full_timestamp),
            "timestamp": str(self.timestamp),
            "append_allow": self.append_allow,
            "priority": str(self.priority)
        }

    def apply_func(self, funcs: tuple):
        for x in funcs:
            if isinstance(x, Callable):
                new = x(self.content)
                if new:
                    self.content = new

    def __str__(self):
        return f"[{self.timestamp}] {self.author}: {self.content}"
