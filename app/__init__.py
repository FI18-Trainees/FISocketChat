from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234567890!"§$%&/()=?'
socketio = SocketIO(app)

from app import sockets
from app import routes