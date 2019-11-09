class User:
    def __init__(self, display_name: str, username: str, avatar: str, chat_color: str):
        self.display_name = display_name
        self.username = username
        self.avatar = avatar
        self.chat_color = chat_color

    def to_json(self) -> dict:
        return



