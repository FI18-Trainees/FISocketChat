# -*- coding: utf-8 -*-
import json
import time
import threading
import os.path

from .shell import Console

SHL = Console("EmotesHandler")


filename = os.path.join("app", "emotes.json")


class Emotes:
    def __init__(self, start):
        self.emotes = {}
        self.runCheck = start
        self.emit_status = None
        if not self.runCheck:
            SHL.output(f"Getting Emotes once!")
            SHL.output(f"Setting new emotes!")
            self.emotes = self.get_emotes()
        else:
            self.start_reloader()

    @staticmethod
    def get_emotes():
        if filename:
            with open(filename, encoding='utf-8', mode='r') as f:
                return json.load(f)

    def start_reloader(self):
        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True  # Daemonize thread
        thread.start()

    def stop_reloader(self):
        self.runCheck = False

    def run(self):
        while self.runCheck:
            try:
                cache = self.get_emotes()
            except:
                SHL.output(f"Failed reading emote file {filename}.")
                cache = None
            else:
                if cache != self.emotes:
                    SHL.output(f"Setting new emotes!")
                    self.emotes = self.get_emotes()
            time.sleep(60)
