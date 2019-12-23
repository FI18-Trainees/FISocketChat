# -*- coding: utf-8 -*-
import sys
import logging

import start_checkup
import log_config
from utils import Console, cfg, white, blue2, red
from app import app
from app.sockets import socketio

SHL = Console("Startup")


def run():
    port = cfg.get("port", 5000)
    start_args = [x.strip().lower() for x in sys.argv]

    if "-port" in start_args:
        try:
            port = int(sys.argv[sys.argv.index("-port") + 1])
        except IndexError:
            pass
        except ValueError:
            raise RuntimeError(f'{red}Invalid port "{sys.argv[sys.argv.index("-port") + 1]}"{white}')

    if "--cfg-debug" in start_args:
        cfg.reload(debug=True)

    SHL.output("Starting up.")
    SHL.output(f"{blue2}Using port: {port}")
    socketio.run(app, host='0.0.0.0', port=port, log_output=False)


if __name__ == '__main__':
    run()
