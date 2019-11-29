# -*- coding: utf-8 -*-
import time
import threading
import os.path

from utils import Console, white, green2, red, cfg


SHL = Console("Resource Manager")


rootfilepath = os.path.join("app", "storage", "uploads")


class Resource_Manager:
    def __init__(self, uploaddict):
        self.maxage = cfg.get('uploads_max_age', 172800)
        self.checkcooldown = cfg.get('uploads_check_cooldown', 43200)
        self.runCheck = False
        self.uploaddict = uploaddict

    def start_reloader(self):
        self.runCheck = True
        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True  # Daemonize thread
        thread.start()

    def stop_reloader(self):
        self.runCheck = False

    def run(self):
        while self.runCheck:
            todelete = list()
            for entry in self.uploaddict:
                if self.uploaddict[entry].get('date').timestamp() + self.maxage < float(time.time()):
                    os.unlink(os.path.join(rootfilepath, self.uploaddict[entry].get('path')))
                    todelete.append(entry)

            for x in todelete:
                del self.uploaddict[x]

            time.sleep(self.checkcooldown)
