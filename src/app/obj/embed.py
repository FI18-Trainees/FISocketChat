from typing import List, Union
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
            "media_type": self.media_type.name,
            "media_url": self.media_url
        }


class Embed:
    """
    Structure:
    {
        content_type = "embed",
        title: str,
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
        thumbnail: str (url),
        append_allow: bool (false)
    }
    """
    __content_type = "embed"

    def __init__(self, title: str, author: User = get_sys_user(), text: str = None, fields: List[Field] = None,
                 media: Media = None, footer: str = None, url: str = "https://github.com/FI18-Trainees/FISocketChat",
                 color: str = "#F04747", thumbnail: str = None, append_allow: bool = False):
        self.__title = title
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
        self.__append_allow = append_allow

    def add_fields(self, fields: Union[Field, Iterable]):
        if isinstance(fields, Field):
            self.__fields.append(fields)
        if isinstance(fields, Iterable):
            for x in fields:
                if isinstance(x, Field):
                    self.__fields.append(x)

    def set_fields(self, fields: Union[Field, Iterable]):
        if isinstance(fields, Field):
            self.__fields = [fields]
        if isinstance(fields, Iterable):
            self.__fields = [x for x in fields if isinstance(x, Field)]

    def set_title(self, new: str):
        if new.strip():
            self.__title = new

    def set_media(self, new: Media):
        self.__media = new

    def set_footer(self, new: str):
        self.__footer = new

    def set_url(self, new: str):
        self.__url = new

    def set_text(self, new: str):
        self.__text = new

    def change_display_name(self, new: str):
        if new.strip():
            self.__author.display_name = new

    def change_chat_color(self, new: str):
        self.__author.chat_color = new

    def set_color(self, new: str):
        if new.strip():
            self.__color = new

    def set_thumbnail(self, new: str):
        self.__thumbnail = new

    def change_append_allow(self, new: bool):
        self.__append_allow = new

    def to_json(self) -> dict:
        basic_dict = {
            "content_type": self.__content_type,
            "title": self.__title,
            "author": self.__author.to_json(),
            "full_timestamp": str(self.__full_timestamp),
            "timestamp": str(self.__timestamp),
        }

        if self.__text:
            basic_dict["text"] = self.__text
        if self.__fields:
            basic_dict["fields"] = [x.to_json() for x in self.__fields]
        if self.__fields:
            basic_dict["media"] = self.__media.to_json()
        if self.__footer:
            basic_dict["footer"] = self.__footer
        if self.__url:
            basic_dict["url"] = self.__url
        if self.__color:
            basic_dict["color"] = self.__color
        if self.__thumbnail:
            basic_dict["thumbnail"] = self.__thumbnail
        if self.__append_allow is not None:
            basic_dict["append_allow"] = self.__append_allow

        return basic_dict
