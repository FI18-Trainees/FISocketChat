# -*- coding: utf-8 -*-
from app import app, socketio
from sys import argv


def run():
    port = 5000
    if "-port" in argv:
        portpos = argv.index("-port") + 1
        if portpos <= len(argv) - 1:
            port = int(argv[portpos])
            print("using custom port: " + str(port))

    socketio.run(app, host='0.0.0.0', port=port)


if __name__ == '__main__':
    run()
