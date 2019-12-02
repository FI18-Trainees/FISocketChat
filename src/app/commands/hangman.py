from app.obj import SystemMessenger, User, Command, Embed, Field
from app.obj.games.hangmangame import HangmanGame
from utils import Console

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
    embed = Embed(title="Hangman", thumbnail="https://image.flaticon.com/icons/png/512/43/43980.png",
                  color="#00ff00", footer="Hangman V1.1")

    if not len(params):
        embed.set_text("/hangman start *word* starts a game of hangman with your own word.")
        system.send(embed)
        return

    if params[0].lower() == "help":
        embed.set_text("Usable commands:<br/>/hangman start *word*<br/>/hangman guess *char*<br/>"
                       "/hangman solve *word*<br/>/hangman state<br/>/hangman info")
        system.send(embed)
        return

    if params[0].lower() == "info":
        embed.set_text("In hangman you get to guess a word being set by the starter of the game. You will see how many"
                       "letters are in the word and then have to either guess each character with 7 possible mistakes"
                       "or you can try to guess the word at once making only one try possible.")
        system.send(embed)
        return

    if params[0].lower() == "start" and params[1].lower() != "":
        if not hangman_game.get_state():
            if not ("-" in params[1] or "_" in params[1]):
                hangman_game.start(params[1], author)
                SHL.output(f"{author} started a game with: {params[1]}", "HangmanGame")  # log
                embed.set_text(f"{author.display_name} is challenging everyone to a hangman game!<br/>"
                               f"The word searched is: {hangman_game.get_word()}")
                system.broadcast(embed)
                return
            system.send_error("No underscores or dashes in word allowed!")
            return
        system.send_error(f"Game already running!<br/>{hangman_game.get_word()}")
        return

    if params[0].lower() == "guess":
        try:
            if hangman_game.get_state():
                if hangman_game.initiator != author:
                    if len(params[1]) != 1:
                        system.send_error("Invalid guess length! Guess has to be single char!")
                        return
                    SHL.output(f"{author} hast tried to guess {params[1]} as a char", "HangmanGame")  # log
                    embed.set_text(f"{author.display_name} has tried {params[1]}<br/>"
                                   f"{hangman_game.check_char(params[1], author)}")
                    system.broadcast(embed)
                    return
                embed.set_text(f"{author.display_name} the filthy cheater tried to guess their own word!")
                embed.set_color("#FF6D00")
                system.broadcast(embed)
                return
            system.send_error(no_game())
            return
        except IndexError:
            system.send_error("Invalid guess! Guess needs to have at least one char!")
            return

    if params[0].lower() == "solve":
        try:
            if hangman_game.get_state():
                if hangman_game.initiator != author:
                    SHL.output(f"{author} tried to solve {hangman_game.word_clear} with {params[1]}",
                               "HangmanGame")  # log
                    embed.set_text(hangman_game.check_word(params[1], author))
                    system.broadcast(embed)
                    return
                embed.set_text(f"{author.display_name} the filthy cheater tried to solve their own word!")
                embed.set_color("#FF6D00")
                system.broadcast(embed)
                return
            system.send_error(no_game())
            return
        except IndexError:
            system.send_error("Invalid guess! Solve needs to have at least one char!")
            return

    if params[0].lower() == "state":
        if hangman_game.get_state():
            embed.set_text(hangman_game.get_word())
            system.send(embed)
            SHL.output(f"{author} fetched the state of the game.", "HangmanGame")  # log
            return
        system.send_error(no_game())
        return

    embed.set_text("Usable commands:<br/>/hangman start *word*<br/>/hangman guess *char*<br/>"
                   "/hangman solve *word*<br/>/hangman state")
    system.send(embed)
