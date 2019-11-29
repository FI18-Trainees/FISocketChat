from app import user_manager, login_disabled
from app.obj import SystemMessenger, User, Command, Embed
from utils import Console

SHL = Console("Command List")

settings = {
    'invoke': 'list',
    'system_display_name': 'System - List',
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    e = Embed(title="Userlist", thumbnail="http://simpleicon.com/wp-content/uploads/users.png", color="#00ff00")
    if login_disabled:
        e.set_text("not available in logindisabled mode.")
    else:
        e.set_text("<br />".join([f"{x['user'].username}: {x['user'].display_name}"
                                  for x in user_manager.configs.values()]))
    system.send(e)
