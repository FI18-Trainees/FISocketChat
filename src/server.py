# -*- coding: utf-8 -*-
from app import app, socketio


def run():
    socketio.run(app, host='0.0.0.0', port='5001')


if __name__ == '__main__':
    run()
