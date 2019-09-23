# -*- coding: utf-8 -*-
from flask import Flask
from flask_socketio import SocketIO
from .emotes import Emotes
from sys import argv


app = Flask(__name__)
app.config['SECRET_KEY'] = '1234567890!"§$%&/()=?'
emotehandler = Emotes(True)


#init settings
if "-disablelogin" in argv:
    logindisabled = True
else:
    logindisabled = False



socketio = SocketIO(app, logger=True, engineio_logger=True, cors_allowed_origins="*")

from . import sockets
from . import routes