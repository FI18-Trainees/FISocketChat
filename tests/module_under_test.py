import time
from src.server import run


class Observer:
    def __init__(self):
        self.running = False

    def fun(self):
        self.running = False

    def infinite_loop(self):
        self.running = True
        try:
            run()
            time.sleep(1)
        except:
            print("hier")
            self.fun()
