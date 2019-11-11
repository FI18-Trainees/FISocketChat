# -*- coding: utf-8 -*-
import sys
import os

os.system("cls" if os.name == "nt" else "clear")

from utils.shell import Console
from app import app, socketio

SHL = Console("Start")


def run():
    port = 5000
    if "-port" in [x.strip().lower() for x in sys.argv]:
        try:
            port = int(sys.argv[sys.argv.index("-port") + 1])
        except IndexError:
            pass
        except ValueError:
            sys.exit(f'Invalid port "{sys.argv[sys.argv.index("-port") + 1]}"')
    SHL.output("Starting up.")
    SHL.output(f"Using port: {port}")
    socketio.run(app, host='0.0.0.0', port=port)


if __name__ == '__main__':
    run()
