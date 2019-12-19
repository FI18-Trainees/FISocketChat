from app.obj import SystemMessenger, User, Command
from utils import Console

SHL = Console("Command Ping")

settings = {
    'invoke': 'ping'
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    system.send("Pong!")
