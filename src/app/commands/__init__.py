import pkgutil
import importlib

from flask_socketio import emit

from app.obj import SystemMessenger, User, Command
from utils.shell import Console, red, white

SHL = Console("CommandLoader")

"""

init script for the commands module
when adding a new command please specify your settings in a dictionary as in every other command file 

mandatory:
    invoke: the invoke of your command as a string
        example: 'ping'

optional:
    log: a boolean that specifies if your command will log to the console when used
        default: True
"""

commands = {}
systems = {}


def parse_param_list(content):
    ret = content[1:].split(" ")
    return [e for e in ret if e != ""]


def register(func, settings):
    invoke = settings.get('invoke')
    log = settings.get('log', True)
    default_display_name = settings.get('system_display_name', None)

    def wrapper(author: User, cmd: Command, params: list, inv: str) -> None:
        if log:
            SHL.output(f"{str(author)} used {str(cmd.msg_body)}", "CommandHandler")  # logging

        systems[inv.lower()].change_display_name(None)
        func(system=systems[inv.lower()], author=author, cmd=cmd, params=params)

    systems[invoke.lower()] = SystemMessenger(default_display_name)
    commands[invoke.lower()] = wrapper
    SHL.output(f"Registered {settings.get('invoke', 'unknown command')}")


def handle_command(author: User, command: Command) -> None:
    if not command.msg_body.startswith("/"):
        emit('error', {"message": "invalid syntax"})
        return

    try:
        params = parse_param_list(command.msg_body)
    except IndexError:
        emit('error', {"message": "invalid invoke"})
        return

    try:
        if params[0].lower() in commands.keys():
            commands[params[0].lower()](author=author, cmd=command, params=params[1:], inv=params[0])
        else:
            emit('error', {"message": "unknown command"})
    except IndexError:
        emit('error', {"message": "invalid syntax"})
    return


def register_all():
    pkgutil.extend_path(__path__, __name__)
    for importer, modname, ispkg in pkgutil.walk_packages(path=__path__, prefix=__name__ + '.'):
        try:
            command = importlib.import_module(modname)
            register(command.main, command.settings)
        except:
            pass
    SHL.output(f"{red}========================{white}")


register_all()
