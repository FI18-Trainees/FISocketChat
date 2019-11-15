class User:
    def __init__(self,
                 display_name: str,
                 username: str,
                 avatar: str = "/public/img/emote1.PNG",
                 chat_color: str = "#FF0000"):
        self.display_name = display_name
        self.username = username
        self.avatar = avatar
        self.chat_color = chat_color

    def to_json(self) -> dict:
        return {
            "display_name": self.display_name,
            "username": self.username,
            "avatar": self.avatar,
            "chat_color": self.chat_color
        }

    def __str__(self):
        return f"{self.display_name} ({self.username})"

    def __eq__(self, other):
        if isinstance(other, User):
            return self.username == other.username
        if isinstance(other, str):
            return self.username == other
        return False


def get_default_user() -> User:
    return User(display_name=None, username=None)
