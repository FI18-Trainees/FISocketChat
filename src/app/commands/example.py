from app.obj import SystemMessenger, User, Command
from utils import Console, white, red
from app.obj import SystemMessage

SHL = Console("Command Example")

settings = {
    'invoke': 'example',  # user would have to use /example to call main function below
    'system_display_name': 'System - Example'  # name of the system user you can send messages with (default: "System")
}

# implement static variables here
path = ""


def main(system: SystemMessenger, author: User, cmd: Command, params: list):  # gets called by commandhandler
    return  # TODO: remove this for your command
    # system: object to send/broadcast messages:
    # author: user object of the user who invoked the command
    # cmd: Command(Message) object of the cmd the user sent
    # params: list of all parameters (without the invoke, split by space)
    # TODO: please try to handle all errors to give a detailed traceback to users,
    # default error message if you do not handle errors is "Something went wrong"
    if not len(params):
        msg = SystemMessage("Example answer")
        system.send(msg)
        system.send("Example answer 2.")  # you can commit a string or SystemMessage obj
        return

    if params[0].lower() == "start":
        # start your process
        system.send("ok")  # try to send an answer every time
        system.broadcast(f"{author.display_name} started the process")  # broadcast to everyone logged in
        return

    if params[0].lower() == "log":
        SHL.output("Use this to log things to stdout")
        SHL.output(f"Use {red}to log errors or warnings{white}.")
        system.send("ok")
        return

    system.send("Detailed help page")
