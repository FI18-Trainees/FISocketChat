import time


class UserLimiter:
    def __init__(self):
        self.users = {}

    def check_cooldown(self, sid):
        if float(time.time() - self.users.get(sid, 0)) <= 0.4:
            return True
        return False

    def update_cooldown(self, sid):
        self.users[sid] = time.time()

    def remove_sid(self, sid):
        try:
            self.users.pop(sid)
        except KeyError:
            return False
        return True

    def __str__(self):
        return self.users
