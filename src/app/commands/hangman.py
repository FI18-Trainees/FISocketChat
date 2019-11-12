from app.obj import SystemMessenger, User, Command
from app.obj.games.hangmangame import HangmanGame
from app.obj.system_message import SystemMessage

hangman_game = HangmanGame()
hangman = SystemMessage("")

settings = {
    'invoke': 'hangman',
    'system_display_name': 'Hangman'
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    # game command should be                            /hangman start *word*
    # then it should be                                 /hangman guess *char*
    # to check game state when connection lost try     /hangman state
    if not hangman_game.get_state():
        if params[0].lower() == "info":
            system.send("Usable commands:<br/>'/hangman start *word*'<br/>'/hangman guess *char*'<br/>"
                        "'/hangman solve *word*'<br/>'state'")
            return
        if params[0].lower() == "start" and params[1].lower != "":
            hangman_game.reset_game()
            hangman_game.start(params[1])
            system.broadcast(f"{author} is challenging everyone to a hangman game!")
            system.broadcast(f"The word searched is: {hangman_game.get_word()}")
            return
    if hangman_game.get_state():
        if params[0].lower() == "guess":
            if len(params[1]) != 1:
                system.send("invalid guess length! guess has to be single char!")
                return
            system.broadcast(f"{author} has tried {params[1]}")
            system.broadcast(hangman_game.check_char(params[1]))
            return
        if params[0].lower() == "solve":
            system.broadcast(hangman_game.check_word(params[1]))
            return
        if params[0].lower() == "state":
            system.send(hangman_game.get_word())
            return
        return
    system.send("Welcome to hangman!<br/>To start a game type '/hangman start *word*'")
