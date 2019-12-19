from .message import Message


class Command(Message):
    __content_type = "command"
