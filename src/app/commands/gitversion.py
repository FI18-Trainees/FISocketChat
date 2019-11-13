from app import user_manager, login_disabled
from app.obj import SystemMessenger, User, Command
from utils.shell import Console, white
import subprocess

SHL = Console("Command List")

settings = {
    'invoke': 'gitversion',
}

# get Version
git_version_short_hash = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode('ascii').strip()
git_version_hash = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
git_remote_url = subprocess.check_output(['git', 'config', '--get', 'remote.origin.url']).decode('ascii').strip().replace(".git", "")
SHL.output(f"{white}Found local version: {git_version_short_hash}", "gitversion")


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    link = git_remote_url + "/commit/" + git_version_hash
    msg = f"Current Version is <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"{link}\">{git_version_short_hash}</a>.<br />"
    system.send(msg)
