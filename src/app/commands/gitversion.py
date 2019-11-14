from app.obj import SystemMessenger, User, Command
from utils.shell import Console, white, red
import subprocess

SHL = Console("Command gitversion")

settings = {
    'invoke': 'gitversion',
    'system_display_name': 'System - gitversion'
}

# get Version
try:
    git_version_short_hash = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode('ascii').strip()
    git_version_hash = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
    git_remote_url = subprocess.check_output(['git', 'config', '--get', 'remote.origin.url']).decode('ascii').strip().replace(".git", "")

    SHL.output(f"{white}Found local version: {git_version_short_hash}", "gitversion")

    __generated_link = git_remote_url + "/commit/" + git_version_hash
    __msg = f"Current running Version  is <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"{__generated_link}\">{git_version_short_hash}</a>.<br />"

except subprocess.CalledProcessError:
    SHL.output(f"{red}Error getting git version", "gitversion")
except UnicodeDecodeError:
    SHL.output(f"{red}Error parsing git version", "gitversion")


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    if not len(params):
        if __msg is not None:
            system.send(__msg)
        else:
            system.send("Error fetching version.")

    if params[0] == "help":
        system.send("[gitversion help]: Displays the hash of the commit the chat is currently running of. "
                    "It also links to the commit on the Repo site where you can view the code.")

