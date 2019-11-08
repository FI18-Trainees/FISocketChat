# -*- coding: utf-8 -*-
import json
import time
import threading
import platform

from .shell import Console

SHL = Console("EmotesHandler")


system = platform.system()
if system == "Windows":
    filename = "app\\emotes.json"
if system == "Linux":
    filename = "app/emotes.json"


class Emotes:
    def __init__(self, start):
        self.emotes = {}
        self.runCheck = start
        self.start_reloader()
        self.emit_status = None

    def get_emotes(self):
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
