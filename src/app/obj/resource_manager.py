# -*- coding: utf-8 -*-
import time
import threading
import os.path

from utils import Console, white, green2, red, cfg

SHL = Console("Resource Manager")

root_filepath = os.path.join("app", "storage", "uploads")


class ResourceManager:
    def __init__(self, upload_dict):
        self.max_age = cfg.get('uploads_max_age', 172800)
        self.check_cooldown = cfg.get('uploads_check_cooldown', 43200)
        self.runCheck = False
        self.upload_dict = upload_dict

    def start_reloader(self):
        self.runCheck = True
        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True  # Daemonize thread
        thread.start()

    def stop_reloader(self):
        self.runCheck = False

    def run(self):
        while self.runCheck:
            to_delete = []
            for entry in self.upload_dict:
                if self.upload_dict[entry].get('date').timestamp() + self.max_age < float(time.time()):
                    os.unlink(os.path.join(root_filepath, self.upload_dict[entry].get('path')))
                    to_delete.append(entry)

            for x in to_delete:
                del self.upload_dict[x]

            time.sleep(self.check_cooldown)
