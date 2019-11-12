from app import user_manager, login_disabled
from app.obj import SystemMessenger, User, Command
from utils.shell import Console
import subprocess

SHL = Console("Command List")

settings = {
    'invoke': 'gitversion',
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    shortversion = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode('ascii').strip()
    version = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
    link = subprocess.check_output(['git', 'config', '--get', 'remote.origin.url']).decode('ascii').strip()
    link = link[:-4] +  "/commit/" + version
    msg = f"Current Version is <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"{link}\">{shortversion}</a>.<br />"
    system.send(msg)
