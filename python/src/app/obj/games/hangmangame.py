from app.obj import User


class HangmanGame:
    def __init__(self, state: bool = False):
        self.state = state
        self.word = []
        self.word_clear = ""
        self.guessed = []
        self.tried = []
        self.mistakes = 0
        self.max_mistakes = 7
        self.failed = False
        self.initiator = None

    def start(self, word: str, initiator: User) -> None:
        self.reset_game()
        self.state = True
        self.word = [x for x in word.lower()]
        self.word_clear = word
        self.guessed = [False] * len(word)
        self.initiator = initiator

    def check_char(self, char: str, author: User) -> str:
        if not all(self.guessed):
            if not self.mistakes >= self.max_mistakes-1:
                if not char.lower() in self.tried:
                    contained = False
                    self.tried.append(char.lower())
                    for e, item in enumerate(self.word):
                        if item == char.lower():
                            contained = True
                            self.guessed[e] = True
                    if not contained:
                        self.mistakes += 1
                    return self.compare_all(author)
                return "You already tried that character!"
            self.failed = True
            self.state = False
            return self.fail(author)
        self.state = False
        return self.success(author)

    def check_word(self, word: str, author: User) -> str:
        if not all(self.guessed):
            if not self.mistakes >= self.max_mistakes-1:
                if [x for x in word.lower()] == self.word:
                    self.state = False
                    self.failed = True
                    return self.success(author)
                self.mistakes += 1
                return self.get_word()
            self.failed = True
            self.state = True
            return self.fail(author)
        self.state = False
        return self.success(author)

    def success(self, author: User) -> str:
        return f'The word was guessed by {author.display_name}!<br/>It was "{self.get_word_short()}".' \
               f'<br/>Please start a new game for another word!'

    def compare_all(self, author: User) -> str:
        if all(self.guessed):
            self.state = False
            return self.success(author)
        return self.get_word()

    def get_word_short(self) -> str:
        return ''.join(self.word)

    def get_word(self) -> str:
        return f"{self.join_word_blanks()}<br/>You have {self.max_mistakes-self.mistakes} tries left!"

    def fail(self, author: User) -> str:
        return f"You made it to: {self.join_word_blanks()} with the guess of {author.display_name}." \
               f"<br/>The word was {self.word_clear}<br/>Please start a new game to try again!"

    def join_word_blanks(self) -> str:
        return f"{''.join([self.word[e] if guess else ' _' for e, guess in enumerate(self.guessed)])}"

    def get_state(self) -> bool:
        return self.state

    def reset_game(self) -> None:
        self.state = False
        self.word = []
        self.word_clear = ""
        self.guessed = []
        self.tried = []
        self.mistakes = 0
        self.max_mistakes = 7
        self.failed = False
        self.initiator = None
