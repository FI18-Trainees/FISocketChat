from . import Message
from . import User


sys_user = User(
    display_name="System",
    username="System",
    chat_color="#FF0000",
    avatar="/public/img/system.png"
)


class SystemMessage(Message):
    def __init__(self, msg_body: str):
        super(SystemMessage, self).__init__(author=sys_user, msg_body=msg_body, system=True)

    def change_display_name(self, new: str):
        self.author.display_name = new
