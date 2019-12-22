# -*- coding: utf-8 -*-
import sys
import os

from utils import Console, cfg, red, white
from app import app
from app.sockets import socketio

if not os.path.exists(os.path.join("app", "public")):
    raise RuntimeError(f"{red}public folder is missing, use 'ng build --prod' and try again{white}")

SHL = Console("Start")


def run():
    port = cfg.get("port", 5000)
    start_args = [x.strip().lower() for x in sys.argv]

    if "-port" in start_args:
        try:
            port = int(sys.argv[sys.argv.index("-port") + 1])
        except IndexError:
            pass
        except ValueError:
            sys.exit(f'Invalid port "{sys.argv[sys.argv.index("-port") + 1]}"')

    if "--cfg-debug" in start_args:
        cfg.reload(debug=True)

    SHL.output("Starting up.")
    SHL.output(f"Using port: {port}")
    socketio.run(app, host='0.0.0.0', port=port)


if __name__ == '__main__':
    run()
