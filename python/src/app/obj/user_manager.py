from .user import User


class UserManager:
    def __init__(self):
        self.configs = {}

    def add(self, sid: str, user: User):
        self.configs[sid] = {
            "user": user
        }

    def rem(self, sid):
        self.configs.pop(sid, None)

    def get_count(self) -> int:
        return len(self.configs)

    def get_sid(self, username: str) -> list:
        return [x for x in self.configs if self.configs[x]["user"].username == username]

    def __str__(self):
        return f"User count: {self.get_count()}"


user_manager = UserManager()
