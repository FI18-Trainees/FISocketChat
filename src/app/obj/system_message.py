from .message import Message
from .user import get_sys_user


class SystemMessage(Message):
    def __init__(self, msg_body: str):
        super(SystemMessage, self).__init__(author=get_sys_user(), msg_body=msg_body, system=True)

    def change_display_name(self, new: str):
        self.author.display_name = new
