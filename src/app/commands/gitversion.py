from app import user_manager, login_disabled, git_remote_url, git_version_hash, git_version_short_hash
from app.obj import SystemMessenger, User, Command
from utils.shell import Console


SHL = Console("Command List")

settings = {
    'invoke': 'gitversion',
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    link = git_remote_url + "/commit/" + git_version_hash
    msg = f"Current Version is <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"{link}\">{git_version_short_hash}</a>.<br />"
    system.send(msg)
