# -*- coding: utf-8 -*-
from app import app, socketio
import sys


def run():
    port = 5000
    if "-port" in [x.strip().lower() for x in sys.argv]:
        portpos = sys.argv.index("-port") + 1
        if portpos <= len(sys.argv) - 1:
            port = int(sys.argv[portpos])
            print("using custom port: " + str(port))

    socketio.run(app, host='0.0.0.0', port=port)


if __name__ == '__main__':
    run()
