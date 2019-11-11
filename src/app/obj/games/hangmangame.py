class HangmanGame:
    def __init__(self, state=False):
        self.state = state
        self.word = []
        self.guessed = []
        self.mistakes = 0
        self.max_mistakes = 7
        self.failed = False

    def start(self, word):
        self.state = True
        self.word = [x for x in word]
        self.guessed = [False] * len(word)

    def check_char(self, char):
        if not all(self.guessed):
            if not self.mistakes == self.max_mistakes-1:
                contained = False
                for e, item in enumerate(self.word):
                    if item.lower() == char.lower():
                        contained = True
                        self.guessed[e] = True
                if not contained:
                    self.mistakes += 1
                return self.compare_all()
            else:
                self.failed = True
                self.state = False
                return self.fail()
        else:
            self.state = False
            return self.success()

    def check_word(self, word):
        if not all(self.guessed):
            if not self.mistakes == self.max_mistakes-1:
                if [x for x in word] == self.word:
                    self.state = False
                    return self.success()
                else:
                    self.mistakes += 1
                    return self.get_word()
            return self.fail()
        else:
            return self.success()

    def success(self):
        return f'The word was Guessed!<br/>It was "{self.get_word_short()}".' \
               f'<br/>Please start a new game for another word!'

    def compare_all(self):
        if all(self.guessed):
            self.state = False
            return self.success()
        else:
            return self.get_word()

    def get_word_short(self):
        return ''.join(self.word)

    def get_word(self):
        return f"{''.join([self.word[e] if guess else ' _' for e, guess in enumerate(self.guessed)])}<br/> \
               You have {self.max_mistakes-self.mistakes} tries left!"

    def fail(self):
        return f'You made it to: ' + ''.join([self.word[e] if guess else ' _' for e, guess in
                                              enumerate(self.guessed)]) + 'Please start a new game to try again!'

    def get_state(self):
        return self.state

    def __str__(self):
        return self.state

    def reset_game(self):
        self.state = False
        self.word = []
        self.guessed = []
        self.mistakes = 0
        self.max_mistakes = 7
        self.failed = False
