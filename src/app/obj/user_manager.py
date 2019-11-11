from .user import User


class UserManager:
    def __init__(self):
        self.configs = {}

    def add(self, sid: str, user: User):
        self.configs[sid] = {  # TODO: use user object
            "user": user
        }

    def rem(self, sid):
        self.configs.pop(sid, None)

    def get_count(self) -> int:
        return len(self.configs)

    def __str__(self):
        return f"User count: {self.get_count()}"
