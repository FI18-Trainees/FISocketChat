import os.path
import json

from .shell import Console

BASE_PATH = "config" if os.path.isdir("config") else "config-default"

PATHS = ["main.json", "sidebar.json"]
SHL = Console("cfg", cls=True)


class __Config:
    def __init__(self, debug: bool = False):
        self.options = {}
        self.reload(debug=debug)

    def reload(self, debug: bool = False):
        SHL.output(f"Reloading config.")
        for path in PATHS:
            SHL.output(f"Reloading configfile {os.path.join(BASE_PATH, path)}")
            try:
                with open(os.path.join(BASE_PATH, path), 'r', encoding="utf-8") as c:
                    data = json.load(c)
            except FileNotFoundError:
                continue
            except json.JSONDecodeError:
                continue

            for key, value in data.items():
                self.options[key] = value
                if debug:
                    SHL.output(f"[{key}]: {value}")

    def get(self, key: str, default=None):
        return self.options.get(key, default)


cfg = __Config()
