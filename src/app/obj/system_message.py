from .message import Message
from .user import User


def get_sys_user() -> User:
    return User(
        display_name="System",
        username="System",
        chat_color="#FF0000",
        avatar="/public/img/system.png"
    )


class SystemMessage(Message):
    def __init__(self, msg_body: str):
        super(SystemMessage, self).__init__(author=get_sys_user(), msg_body=msg_body, system=True)

    def change_display_name(self, new: str):
        self.author.display_name = new
