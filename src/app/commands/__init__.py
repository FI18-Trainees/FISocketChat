import pkgutil
import importlib

from flask_socketio import emit

from ..shell import *

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


def parse(content):
    ret = content[1:].split(" ")
    return [e for e in ret if e != ""]


def register(func, settings):
    invoke = settings.get('invoke')
    log = settings.get('log', True)

    def wrapper(system, author, message, params):
        if log:
            SHL.output(f"{str(author)} used {str(message)}", "CommandHandler")  # logging

        func(system, author, message, params)

    commands[invoke.lower()] = wrapper
    SHL.output(f"Registered {settings.get('invoke', 'unknown command')}")


def handle_command(system, author, command_body):
    if not command_body.startswith("/"):
        emit('error', {"message": "invalid syntax"})
        return

    try:
        params = parse(command_body)
    except IndexError:
        emit('error', {"message": "invalid invoke"})
        return

    try:
        if params[0].lower() in commands.keys():
            commands[params[0].lower()](system, author, command_body, params[1:])
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
