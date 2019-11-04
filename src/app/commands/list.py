from flask_socketio import emit

from ..shell import *
from .. import user_manager, logindisabled

SHL = Console("Command List")

settings = {
    'invoke': 'list',
}


def main(system, author, message, params):
    msg = f"There are {user_manager.get_count()} user(s) connected.\n"
    if not logindisabled:
        for sid in user_manager.sids:
            msg += f"{user_manager.configs[sid]['username']}: " \
                   f"{user_manager.configs[sid]['userconfig']['display_name']} \n"
    system.system_emit(msg)
