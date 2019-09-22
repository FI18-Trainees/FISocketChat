# -*- coding: utf-8 -*-
from src.app import app, socketio

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port='3000')