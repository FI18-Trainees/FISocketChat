from flask import Flask
from flask_socketio import SocketIO
from app.emotes import Emotes


app = Flask(__name__)
app.config['SECRET_KEY'] = '1234567890!"§$%&/()=?'
emotehandler = Emotes(True)
socketio = SocketIO(app)


from app import sockets
from app import routes

