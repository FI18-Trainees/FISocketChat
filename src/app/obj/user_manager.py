from . import User


class UserManager:
    def __init__(self, init_value=0):
        self.count = init_value
        self.configs = {}
        self.users = {}

    def add(self, sid: str, user: User, username=None, userconfig=None):
        self.count += 1
        self.configs[sid] = {
            "username": username,
            "userconfig": userconfig
        }
        self.users[sid] = user

    def rem(self, sid):
        self.count -= 1
        self.configs.pop(sid, None)
        if self.count < 0: self.count = 0

    def get_count(self) -> int:
        return self.count

    def __str__(self):
        return f"User count: {self.count}"
