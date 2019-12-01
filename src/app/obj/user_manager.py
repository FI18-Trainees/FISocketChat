from .user import User


class UserManager:
    def __init__(self):
        self.configs = {}

    def add(self, sid: str, user: User, secret: str):
        self.configs[sid] = {
            "user": user,
            "secret": secret
        }

    def rem(self, sid):
        self.configs.pop(sid, None)

    def get_count(self) -> int:
        return len(self.configs)

    def get_sid(self, username: str) -> list:
        return [x for x in self.configs if x["user"].username == username]

    def authenticate_user_for_sid(self, sid: str, username: str, secret: str) -> bool:
        user = self.configs.get(sid, {}).get("user", None)
        true_secret = self.configs.get(sid, {}).get("secret", None)
        if user:
            return user.username == username and true_secret == secret
        return False

    def __str__(self):
        return f"User count: {self.get_count()}"


user_manager = UserManager()
