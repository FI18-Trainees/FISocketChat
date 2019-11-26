from app.obj import SystemMessenger, User, Command
from utils import Console, green2, white
import random
import json
import os.path

SHL = Console("Command quote")

settings = {
    'invoke': 'quote',
    'system_display_name': 'Quotinator'
}

if not os.path.exists(os.path.join("app", "storage", "quotes")):
    os.makedirs(os.path.join("app", "storage", "quotes"), exist_ok=True)
    SHL.output(f"{green2}Quotes  folder was not present, created quotes folder.{white}", "Quotes")

filename = os.path.join("app", "storage", "quotes", "quotes.json")
with open(filename, 'r', encoding="utf-8") as c:
    quotes = list(set(json.load(c)))


def main(system: SystemMessenger, author: User, cmd: Command, params: list):
    if not len(params):
        system.send("/quote can be either used to register or show quotes.")
        return

    if params[0].lower() == "help":
        system.send("Usable commands:<br/>/quote register<br/>/quote random<br/>/quote info<br/>/quote viewall<br/>"
                    "/quote count<br/>/quote #")
        return

    if params[0].lower() == "info":
        system.send("To register a quote type /quote register and then your sentence you want to register.")
        return

    if params[0].lower() == "random":
        system.broadcast(f"<i>{random.choice(quotes)}</i>")
        return

    if params[0].lower() == "count":
        system.broadcast(f"We currently have {len(quotes)} quotes registered.")
        return

    if params[0].lower() == "viewall":
        msg = "<br/>".join(quotes)
        system.send(f"<i>{msg}</i>")
        return

    if params[0].lower() == "register":
        if len(params) > 1:
            quote = ' '.join(params[1:])
            quotes.append(quote)
            with open(filename, 'w', encoding="utf-8") as f:
                json.dump(list(set(quotes)), f)
            SHL.output(f"Quote registered! : {quote} | Quote written to file.")
            system.send(f"Quote \"{quote}\" successfully registered")
            return
        system.send("Please also provide a sentence to register.")
        return

    if params[0].lower() == "#":
        if len(params) > 1:
            if params[1].isdigit():
                if len(quotes) >= int(params[1]) > 0:
                    system.send(f"<i>{quotes[int(params[1])]}</i>")
                    return
                system.send("The number you provided is too large or below 0")
                return
            system.send("Character is not a number!")
            return
        system.send("Please provide a number you want to view")
        return

    system.send("For further information on /quote, see /quote help or /quote info")
