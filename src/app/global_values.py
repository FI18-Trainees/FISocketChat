class Count:
    def __init__(self, init_value):
        self.count = init_value

    def add(self):
        self.count += 1

    def rem(self):
        self.count -= 1

    def get_count(self):
        return self.count


count = Count(0)
