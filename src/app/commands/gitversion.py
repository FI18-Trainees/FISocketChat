from app.obj import SystemMessenger, User, Command
from utils.shell import Console, white, red, yellow
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
    git_remote_url = subprocess.check_output(['git', 'config', '--get', 'remote.origin.url']).decode('ascii').strip()

    if git_remote_url.startswith("git@"):
        __git_remote_host = git_remote_url[4:git_remote_url.index(":")]
        __git_remote_repo = git_remote_url[git_remote_url.index(":")+1:]
        git_remote_url = "https://" + __git_remote_host + "/" + __git_remote_repo

        SHL.output(f"{white}Found local version: {git_version_short_hash}, Git over SSH", "gitversion")

        __generated_link = git_remote_url + "/commits/" + git_version_hash
        __msg = f"Current Version is <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"{__generated_link}\">{git_version_short_hash}</a>.<br />"

    elif git_remote_url.startswith("https://"):
        git_remote_url.replace(".git", "")

        SHL.output(f"{white}Found local version: {git_version_short_hash}, Git over HTTPS", "gitversion")

        __generated_link = git_remote_url + "/commits/" + git_version_hash
        __msg = f"Current Version is <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"{__generated_link}\">{git_version_short_hash}</a>.<br />"

    else:
        SHL.output(f"{red}Git remote URL could not be parsed, gitversion cannot link to the repo.", "gitversion")

        SHL.output(f"{yellow}Found local version: {git_version_short_hash}, Git remote not found", "gitversion")

        __msg = f"Current Version is {git_version_short_hash}.<br /> " \
                f"<a class=\"text-danger\">Error getting remote URL, cannot link to repo. Server owner messed up.</a>"


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
        return

    if params[0] == "help":
        system.send("[gitversion help]: Displays the hash of the commit the chat is currently running of. "
                    "It also links to the commit on the Repo site where you can view the code.")

