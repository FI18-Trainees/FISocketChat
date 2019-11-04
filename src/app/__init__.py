# -*- coding: utf-8 -*-
import sys
import requests
from re import compile, MULTILINE

from flask import Flask
from flask_socketio import SocketIO
from flask_httpauth import HTTPTokenAuth
from flask import redirect, request

from .shell import *
from .emotes import Emotes
from .user_limiter import UserLimiter
from .global_values import UserCount, Others
from .commands import handle_command

SHL = Console("Init")
auth = HTTPTokenAuth()
others = Others()
user_count = UserCount()
app = Flask(__name__)
app.config['SECRET_KEY'] = '1234567890!"§$%&/()=?'
emotehandler = Emotes(True)
user_limit = UserLimiter()

emoteregex = compile(r"[\"'/]?[/?!:\w]+[\"'/]?", MULTILINE)
htmlregex = compile(r"[&<>]", MULTILINE)
linkregex = compile(r"[A-Za-z0-9\-._~:/?#\[\]@!&$%()*+,;=]+", MULTILINE)
youtuberegex = compile(r"(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|playlist\?|watch\?v=|watch\?.+(?:&|&#38;);v=))([a-zA-Z0-9\-_]{11})?")
imageregex = compile(r"(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)")

if "-disablelogin" in [x.strip().lower() for x in sys.argv]:
    SHL.output(f"{red}Disabled authentication.{white}")
    logindisabled = True
else:
    logindisabled = False


@auth.error_handler
def auth_error():
    return redirect(f"https://info.zaanposni.com/?redirect=https://chat.zaanposni.com/{request.script_root + request.path}", code=401)


@auth.verify_token
def verify_token(token):
    if logindisabled:
        return True
    token = request.cookies.get("access_token", token)
    SHL.output(f"Verify session with token: {token}.", "TokenAuth")
    try:
        ip = request.headers["X-Forwarded-For"]
    except KeyError:
        SHL.output(f"{red}Returning False, invalid headers.{white}", "TokenAuth")
        return False

    r = requests.get("https://auth.zaanposni.com/verify",
                     headers={
                         'Cache-Control': 'no-cache',
                         'X-Auth-For': ip,
                         'Authorization': f"Bearer {token}"
                             })
    SHL.output(f"Response from auth service: {r.text}", "TokenAuth")
    if r.status_code == 200:
        SHL.output(f"{green2}Returning True.{white}", "TokenAuth")
        return r.text
    SHL.output(f"{red}Returning False, invalid session.{white}", "TokenAuth")
    return False


socketio = SocketIO(app, logger=True, engineio_logger=True, cors_allowed_origins="*")

from .sockets import emit_status  # TODO: dafuq is this, send help
emotehandler.set_emit_socket(emit_status)
from . import routes
