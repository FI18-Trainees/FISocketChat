from app import user_manager, login_disabled
from app.obj import SystemMessenger, User, Command, Embed
from utils import Console

SHL = Console("Command List")

settings = {
    'invoke': 'list',
    'system_display_name': 'System - List',
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    if not len(params):
        embed = Embed(title="Userlist", thumbnail="http://simpleicon.com/wp-content/uploads/users.png", color="#00ff00")
        if login_disabled:
            embed.set_text("not available in logindisabled mode.")
        else:
            embed.set_text("<br />".join([f"{x['user'].username}: {x['user'].display_name}"
                                      for x in user_manager.configs.values()]))
        system.send(embed)
        return

    if params[0] == "help":
        system.send("[list help]: Displays a list of all connected users.")
