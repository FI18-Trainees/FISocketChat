from app.obj import SystemMessenger, User, Command
from utils.shell import Console, white, red
from app.obj import Embed, Field, Media, media_types

SHL = Console("Command Embed")

settings = {
    'invoke': 'embedtest',  # user would have to use /example to call main function below
    'system_display_name': 'System - Example'  # name of the system user you can send messages with (default: "System")
}


def main(system: SystemMessenger, author: User, cmd: Command, params: list):  # gets called by commandhandler

    fields = [Field(topic="cooler titel des felds", value="text des felds<br/>auch mit newlines") for x in range(3)]
    media = Media(media_type=media_types.img, media_url="https://i.imgur.com/nTfijG2.jpg")

    e = Embed(text="cooler text", fields=fields, media=media,
              footer="hier unten stehen auch coole dinge",
              thumbnail="https://www.gameswirtschaft.de/wp-content/uploads/2016/10/PietSmiet-Team-GamesWirtschaft.jpg")

    system.send(e)
