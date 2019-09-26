# -*- coding: utf-8 -*-
import json
import time
import threading
import platform


system = platform.system()
if system == "Windows":
    filename = "app\\emotes.json"
if system == "Linux":
    filename = "app/emotes.json"


class Emotes:
    def __init__(self, start):
        self.emotes = {}
        self.runCheck = start
        self.startreloader()
        self.socket = None

    def getemotes(self):
        if filename:
            with open(filename, encoding='utf-8', mode='r') as f:
                return json.load(f)

    def startreloader(self):
        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True  # Daemonize thread
        thread.start()

    def stopreloader(self):
        self.runCheck = False

    def run(self):
        while self.runCheck:
            try:
                cache = self.getemotes()
            except:
                print(f"Failed reading emote file {filename}")
                cache = None
            if cache is not None and cache != self.emotes:
                self.emotes = self.getemotes()
                if self.socket is not None:
                    self.socket.emitstatus({'newemote': 1})
            time.sleep(60)

    def setSocket(self, socket):
        self.socket = socket
