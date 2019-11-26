from .message import Message, prio_types
from .user import get_sys_user


class SystemMessage(Message):
    def __init__(self, content: str, priority: prio_types = prio_types.default, append_allow: bool = True):
        super(SystemMessage, self).__init__(author=get_sys_user(), content=content, priority=priority,
                                            append_allow=append_allow, system=True)

    def change_display_name(self, new: str):
        self.author.display_name = new

    def change_append_allow(self, new: bool):
        self.append_allow = new

    def change_priority(self, new: prio_types):
        self.priority = new
