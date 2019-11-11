import time


class UserLimiter:
    def __init__(self):
        self.user_cooldowns = {}

    def check_cooldown(self, sid):
        if float(time.time() - self.user_cooldowns.get(sid, 0)) <= 0.4:
            return True
        return False

    def update_cooldown(self, sid):
        self.user_cooldowns[sid] = time.time()

    def remove_sid(self, sid):
        self.user_cooldowns.pop(sid, None)

    def __str__(self):
        return self.user_cooldowns
