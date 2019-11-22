from app.obj import SystemMessenger, User, Command
from utils import Console, green2, white
from random import randint as rand
import json
import os.path

SHL = Console("Command quote")

settings = {
    'invoke': 'quote',
    'system_display_name': 'Quotinator'
}

if not os.path.exists(os.path.join("app", "storage", "quotes")):
    os.makedirs(os.path.join("app", "storage", "quotes"), exist_ok=True)
    SHL.output(f"{green2}Quotes  folder was not present, created quotes folder.{white}", "Upload")

filename = os.path.join("app", "storage", "quotes", "quotes.json")
quotes = json.load(open(filename, encoding='utf-8', mode='a'))
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
            with open(filename, encoding='utf-8', mode='a') as x:
                x.write(quotes)
            SHL.output(f"Quote registered! {index} : {quote} | Quote written to file.")
            system.send(f"Quote \"{quote}\" successfully registered")
            return
        system.send("Please also provide a sentence to register and not just type /quote register.")
        return

    system.send("For further information on /quote see '/quote help' or '/quote info'")
