from app.obj import SystemMessenger, User, Command
from app.obj.games.hangmangame import HangmanGame
from utils.shell import Console

hangman_game = HangmanGame()

SHL = Console("HangmanGame")

settings = {
    'invoke': 'hangman',
    'system_display_name': 'Hangman'
}


def no_game() -> str:
    return "No Game started! Use /hangman start *word to start a game."


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    # game command should be                            /hangman start *word*
    # then it should be                                 /hangman guess *char*
    # to check game state when connection lost try     /hangman state
    if not len(params):
        system.send("/hangman starts a game of hangman with your own word.")
        return
    if params[0].lower() == "help":
        system.send("Usable commands:<br/>'/hangman start *word*'<br/>'/hangman guess *char*'<br/>"
                    "'/hangman solve *word*'<br/>'/hangman state'<br/>/hangman info")
        return
    if params[0].lower() == "info":
        system.send("In hangman you get to guess a word being set by the starter of the game. You will see how many"
                    "letters are in the word and then have to either guess each character with 7 possible mistakes"
                    "or you can try to guess the word at once making only one try possible.")
        return
    if params[0].lower() == "start" and params[1].lower != "":
        if not hangman_game.get_state():
            if not params[1].lower == " ":
                hangman_game.reset_game()
                hangman_game.start(params[1])
                SHL.output(f"{author} started a game with: {params[1]}", "HangmanGame")  # log
                system.broadcast(f"{author} is challenging everyone to a hangman game!")
                system.broadcast(f"The word searched is: {hangman_game.get_word()}")
                return
            system.send("No spaces!")
        system.send(f"Game already running!<br/>{hangman_game.get_word()}")
    if params[0].lower() == "guess":
        if hangman_game.get_state():
            if len(params[1]) != 1:
                system.send("invalid guess length! guess has to be single char!")
                return
            system.broadcast(f"{author} has tried {params[1]}")
            SHL.output(f"{author} hast tried to guess {params[1]} as a char", "HangmanGame")  # log
            system.broadcast(hangman_game.check_char(params[1]))
            return
        system.send(no_game())
    if params[0].lower() == "solve":
        if hangman_game.get_state():
            SHL.output(f"{author} tried to solve {hangman_game.word_clear} with {params[1]}", "HangmanGame")  # log
            system.broadcast(hangman_game.check_word(params[1]))
            return
        system.send(no_game())
    if params[0].lower() == "state":
        if hangman_game.get_state():
            system.send(hangman_game.get_word())
            SHL.output(f"{author} fetched the state of the game.", "HangmanGame")  # log
            return
        system.send(no_game())
    system.send("Usable commands:<br/>'/hangman start *word*'<br/>'/hangman guess *char*'<br/>"
                "'/hangman solve *word*'<br/>'state'")
