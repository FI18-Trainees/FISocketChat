from flask_socketio import emit

from ..shell import *

SHL = Console("Command Ping")

settings = {
    'invoke': 'ping',
}


def main(system, author, message, params):
    system.system_emit("Pong!")
