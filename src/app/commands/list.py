from flask_socketio import emit

from ..shell import *
from .. import user_manager, logindisabled
from ..obj import SystemMessenger, User, Command

SHL = Console("Command List")

settings = {
    'invoke': 'list',
}


def main(system: SystemMessenger, author: User, message: Command, params: list):
    msg = f"There are {user_manager.get_count()} user(s) connected.<br />"
    if not logindisabled:
        for sid, cfg in user_manager.configs.items():
            msg += f"{cfg['username']}: " \
                   f"{cfg['userconfig']['display_name']} <br />"
    system.send(msg)
