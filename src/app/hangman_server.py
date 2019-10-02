class Hangman:
    word = input('Please provide your word: ')
    guessed = [False] * len(word)
    tries = 0
    max_tries = 15

    while not all(guessed) and tries <= max_tries:
        print('=' * 15)
        print(f'This is your {tries}.Try.')
        print(f'Please guess: ' + ''.join([word[e] if guess else '_ ' for e, guess in enumerate(guessed)]))
        print('Please guess a char:')
        print('=' * 15)
        char = input()

        if len(char) == 1:
            tries += 1
            for e, item in enumerate(word):
                if item.lower() == char.lower():
                    guessed[e] = True
        else:
            print('Invalid input.')

    if all(guessed):
        print(f'You guessed the word within {tries}/{max_tries} tries!')
        print(f'The word was "{word}".')
    else:
        print(f'You wasted {max_tries} tries!')
        print(f'You got: ' + ''.join([word[e] if guess else '_' for e, guess in enumerate(guessed)]))
        print(f'The word was: "{word}".')
