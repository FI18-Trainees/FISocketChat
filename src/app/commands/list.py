from app import user_manager, login_disabled
from app.obj import SystemMessenger, User, Command
from utils import Console

SHL = Console("Command List")

settings = {
    'invoke': 'list',
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    msg = f"There are {user_manager.get_count()} user(s) connected.<br />"
    if not login_disabled:
        for user in user_manager.configs.values():
            msg += f"{user['user'].username}: " \
                   f"{user['user'].display_name} <br />"
    system.send(msg)
