from ..shell import *
from ..obj import SystemMessenger, User, Command

SHL = Console("Command Ping")

settings = {
    'invoke': 'ping',
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    system.send("Pong!")
