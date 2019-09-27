# -*- coding: utf-8 -*-
from flask import Flask
from flask_socketio import SocketIO
from .emotes import Emotes
import sys
from re import compile, MULTILINE
from .global_values import UserCount
from flask_httpauth import HTTPTokenAuth
import requests
from flask import redirect, request

auth = HTTPTokenAuth()


@auth.error_handler
def auth_error():
    return redirect("https://info.zaanposni.com", code=401)


@auth.verify_token
def verify_token(token):
    if logindisabled:
        return True
    token = request.cookies.get("access_token", "")
    try:
        header = request.headers["X-Forwarded-For"]
    except KeyError:
        return False

    r = requests.get("https://auth.zaanposni.com/verify",
                     headers={
                         'Cache-Control': 'no-cache',
                         'X-Auth-For': header,
                         'Authorization': f"Bearer {token}"
                             })
    if r.text == "OK":
        return True
    return False


app = Flask(__name__)
app.config['SECRET_KEY'] = '1234567890!"§$%&/()=?'
emotehandler = Emotes(True)

# init settings
if "-disablelogin" in [x.strip().lower() for x in sys.argv]:
    print("Disabled authentication")
    logindisabled = True
else:
    logindisabled = False


emoteregex = compile(r"[\"'/]?[/?!:\w]+[\"'/]?", MULTILINE)
htmlregex = compile(r"[&<>]", MULTILINE)
linkregex = compile(r"[A-Za-z0-9\-._~:/?#\[\]@!&$%()*+,;=]+", MULTILINE)
youtuberegex = compile(r"(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|playlist\?|watch\?v=|watch\?.+(?:&|&#38;);v=))([a-zA-Z0-9\-_]{11})?")


socketio = SocketIO(app, logger=True, engineio_logger=True, cors_allowed_origins="*")
user_count = UserCount()


from . import sockets
emotehandler.setSocket(sockets)
from . import routes
