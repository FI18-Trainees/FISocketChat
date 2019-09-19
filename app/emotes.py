import json
import time
import threading

filename = "app\\emotes.json"


class Emotes:
	def __init__(self, start):
		self.emotes = {}
		self.runCheck = start
		self.getemotes()
		self.startreloader()

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
			self.emotes = self.getemotes()
			time.sleep(20)
