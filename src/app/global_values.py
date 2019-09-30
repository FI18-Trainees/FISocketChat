class UserCount:
    def __init__(self, init_value=0):
        self.count = init_value

    def add(self):
        self.count += 1

    def rem(self):
        self.count -= 1
        if self.count < 0: self.count = 0

    def get_count(self):
        return self.count

    def __str__(self):
        return f"User count: {self.count}"


class Others:
    pass
