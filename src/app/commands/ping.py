from app.obj import SystemMessenger, User, Command
from utils.shell import Console

SHL = Console("Command Ping")

settings = {
    'invoke': 'ping'
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    system.send("Pong!")
