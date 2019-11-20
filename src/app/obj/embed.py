from typing import List
from datetime import datetime
from collections.abc import Iterable

from aenum import Enum

from .user import User, get_sys_user

media_types = Enum("media_types", "img video audio gif")


class Field:
    def __init__(self, topic: str, value: str):
        self.topic = topic
        self.value = value

    def to_json(self) -> dict:
        return {
            "topic": self.topic,
            "value": self.value
        }


class Media:
    def __init__(self, media_type: media_types, media_url: str):
        self.media_type = media_type
        self.media_url = media_url

    def to_json(self) -> dict:
        return {
            "media_type": self.media_type,
            "media_url": self.media_url
        }


class Embed:
    """
    Structure:
    {
        content_type = "embed"
        author:
            {
                "display_name": str,
                "username": str,
                "avatar": str (url),
                "chat_color": str (hex color)
            }
        text: str,
        fields:
            [
            {
                "topic": str,
                "value": str
            }
            ],
        media:
            {
                "media_type": str,
                "media_url": str (url)
            },
        footer: str,
        full_timestamp:  str,
        timestamp: str,
        url: str (url),
        color: str (hex color),
        thumbnail: str (url)
    }
    """
    __content_type = "embed"

    def __init__(self, author: User = get_sys_user(), text: str = None, fields: List[Field] = None, media: Media = None,
                 footer: str = None, url: str = "https://github.com/FI18-Trainees/FISocketChat",
                 color: str = "#eb4034", thumbnail: str = None):
        self.__author = author
        self.__text = text
        self.__fields = fields
        self.__media = media
        self.__footer = footer
        self.__full_timestamp = datetime.now()
        self.__timestamp = self.__full_timestamp.strftime("%H:%M:%S")
        self.__url = url
        self.__color = color
        self.__thumbnail = thumbnail

    def add_fields(self, fields):
        if isinstance(fields, Field):
            self.__fields.append(fields)
        if isinstance(fields, Iterable):
            for x in fields:
                self.__fields.append(x)

    def set_fields(self, fields):
        if isinstance(fields, Field):
            self.__fields = [fields]
        if isinstance(fields, Iterable):
            self.__fields = list(fields)

    def set_media(self, media: Media):
        self.__media = media

    def set_footer(self, new: str):
        self.__footer = new

    def set_url(self, new: str):
        self.__url = new

    def set_text(self, new: str):
        self.__text = new

    def change_display_name(self, new: str):
        self.__author.display_name = new

    def change_chat_color(self, new: str):
        self.__author.chat_color = new

    def set_color(self, new: str):
        self.__color = new

    def set_thumbnail(self, new: str):
        self.__thumbnail = new

    def to_json(self) -> dict:
        return {
            "content_type": self.__content_type,
            "author": self.__author.to_json(),
            "text": self.__text,
            "fields": [x.to_json() for x in self.__fields],
            "media": self.__media.to_json(),
            "footer": self.__footer,
            "full_timestamp":  str(self.__full_timestamp),
            "timestamp": str(self.__timestamp),
            "url": self.__url,
            "color": self.__color,
            "thumbnail": self.__thumbnail
        }
