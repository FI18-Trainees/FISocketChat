from app.obj import SystemMessenger, User, Command
from utils import Console, white, red
from random import randint as rand
from app.obj import SystemMessage
import json
import os.path

SHL = Console("Quotes")

settings = {
    'invoke': 'quote',
    'system_display_name': 'Quotinator'
}

path = ""
file = os.path.join("app", "storage", "quotes", "quotes.json")


def get_quotes():
    if file:
        with open(file, encoding='utf-8', mode='r') as f:
            return json.load(f)


quotes = get_quotes()
index = len(quotes)


def main(system: SystemMessenger, author: User, cmd: Command, params: list):

    if not len(params):
        system.send("'/quote can be either used to register or show quotes.")
        return

    if params[0].lower() == "help":
        system.send("Usable commands:<br/>'/quote register \"sentence\"'<br/>'/quote random'<br/>"
                    "'/quote #X'<br/>/quote info")
        return

    if params[0].lower() == "info":
        system.send("To register a quote type /quote register and then your sentence you want to register.")
        return

    if params[0].lower() == "random":
        e = rand(0, len(quotes))
        system.broadcast(f"<i>{quotes[e]}</i>")
        return

    if params[0].lower() == "register":
        if len(params) > 2:
            quote = ' '.join(params[1:])
            quotes.update(index, quote)
            with open(file, encoding='utf-8', mode='a') as x:
                x.write(quotes)
                x.close()
                SHL.output(f"Quote registered! {index} : {quote} | Quote written to file.")
            system.send(f"Quote \"{quote}\" successfully registered")
            return
        system.send("Please also provide a sentence to register and not just type /quote register.")
        return

    system.send("For further information on /quote see '/quote help' or '/quote info'")
