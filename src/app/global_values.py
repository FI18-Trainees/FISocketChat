class UserManager:
    def __init__(self, init_value=0):
        self.count = init_value
        self.configs = {}

    def add(self, sid, username=None, userconfig=None):
        self.count += 1
        self.configs[sid] = {
            "username": username,
            "userconfig": userconfig
        }

    def rem(self, sid):
        self.count -= 1
        self.configs.pop(sid, None)
        if self.count < 0: self.count = 0

    def get_count(self):
        return self.count

    def __str__(self):
        return f"User count: {self.count}"


class Others:
    pass
