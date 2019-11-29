from app.obj import SystemMessenger, User, Command, Embed
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
    embed = Embed(title="Quote", thumbnail="http://simpleicon.com/wp-content/uploads/users.png", color="#00ff00")

    if not len(params):
        embed.set_text("/quote can be either used to register or show quotes.")
        system.send(embed)
        return

    if params[0].lower() == "help":
        embed.set_text("Usable commands:<br/>/quote register<br/>/quote random<br/>/quote info<br/>/quote viewall<br/>"
                       "/quote count<br/>/quote #")
        system.send(embed)
        return

    if params[0].lower() == "info":
        embed.set_text("To register a quote type /quote register and then your sentence you want to register.")
        system.send(embed)
        return

    if params[0].lower() == "random":
        embed.set_text(f"<i>{random.choice(quotes)}</i>")
        system.broadcast(embed)
        return

    if params[0].lower() == "count":
        embed.set_text(f"We currently have {len(quotes)} quotes registered.")
        system.send(embed)
        return

    if params[0].lower() == "viewall":
        msg = "<br/>".join(quotes)
        embed.set_text(f"<i>{msg}</i>")
        system.send(embed)
        return

    if params[0].lower() == "register":
        if len(params) > 1:
            quote = ' '.join(params[1:])
            quotes.append(quote)
            with open(filename, 'w', encoding="utf-8") as f:
                json.dump(list(set(quotes)), f)
            SHL.output(f"Quote registered! : {quote} | Quote written to file.")
            embed.set_text(f"Quote \"{quote}\" successfully registered")
            system.send(embed)
            return
        system.send_error("Please also provide a sentence to register.")
        return

    if params[0].lower() == "#":
        if len(params) > 1:
            if params[1].isdigit():
                if len(quotes) > int(params[1]) >= 0:
                    embed.set_text(f"<i>{quotes[int(params[1])]}</i>")
                    system.send(embed)
                    return
                system.send_error("The number you provided is too large or below 0")
                return
            system.send_error("Character is not a number!")
            return
        system.send_error("Please provide a number you want to view")
        return

    embed.set_text("For further information on /quote, see /quote help or /quote info")
    system.send(embed)
