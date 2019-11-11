from flask_socketio import emit

from utils.shell import *
from app.obj import SystemMessenger, User, Command
from app.obj.games.hangmangame import HangmanGame
from app.obj.system_message import SystemMessage

hangman_game = HangmanGame()
hangman = SystemMessage("")
hangman.change_display_name("Hangman")

SHL = Console("Command List")

settings = {
    'invoke': 'hangman',
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    # game command should be                            /hangman start *word*
    # then it should be                                 /hangman guess *char*
    # to check game state when connection lost try     /hangman state
    if not hangman_game.get_state():
        if params[0].lower() != "start":
            hangman.msg_body = "Game not started!"
            system.send(hangman)
            return
        elif params[0].lower() == "start" and params[1].lower != "":
            hangman_game.reset_game()
            hangman_game.start(params[1])
            hangman.msg_body = f"{author} is challenging everyone to a hangman game!"
            system.broadcast(hangman)
            hangman.msg_body = f"The word searched is: {hangman_game.get_word()}"
            system.broadcast(hangman)
            return
    if hangman_game.get_state():
        if params[0].lower() == "guess":
            if len(params[1]) != 1:
                hangman.msg_body = "invalid guess length! guess has to be single char!"
                system.send(hangman)
                return
            else:
                hangman.msg_body = f"{author} has tried {params[1]}"
                system.broadcast(hangman)
                hangman.msg_body = hangman_game.check_char(params[1])
                system.broadcast(hangman)
                return
        if params[0].lower() == "solve":
            hangman.msg_body = hangman_game.check_word(params[1])
            system.broadcast(hangman)
            return
        if params[0].lower() == "state":
            hangman.msg_body = hangman_game.get_word()
            system.send(hangman)
            return
        return
