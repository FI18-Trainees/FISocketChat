# -*- coding: utf-8 -*-
from app import app, socketio
from app.shell import *
import sys
SHL = Console("Start")


def run():
    port = 5000
    if "-port" in [x.strip().lower() for x in sys.argv]:
        try:
            port = int(sys.argv[sys.argv.index("-port") + 1])
            SHL.output(f"{red}Using custom port: {port}{white}")
            print("using custom port: " + str(port))
        except IndexError:
            pass
        except ValueError:
            sys.exit(f'Invalid port "{sys.argv[sys.argv.index("-port") + 1]}"')
    SHL.output("Starting up.")
    socketio.run(app, host='0.0.0.0', port=port)


if __name__ == '__main__':
    run()
