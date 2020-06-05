# -*- coding: utf-8 -*-
import sys
import os
import shutil
import requests
from re import compile, MULTILINE, IGNORECASE

from flask import Flask
from flask_socketio import SocketIO
from flask_httpauth import HTTPTokenAuth
from flask import redirect, request

from app.emotes import Emotes
from app.obj import user_manager, get_default_user, user_limiter, SystemMessenger, SystemMessage, chat_history
from utils import Console, white, green2, red, cfg

SHL = Console("Init")

# APP
app = Flask(__name__)
app.config['SECRET_KEY'] = '1234567890!"§$%&/()=?'
app.config['JSON_SORT_KEYS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join("app", "storage", "uploads")
app.config['MAX_CONTENT_LENGTH'] = 3.5 * 1024 * 1024    # 3.5 Mb limit

auth = HTTPTokenAuth()

# SOCKETS
socketio = SocketIO(app, logger=True, engineio_logger=True, cors_allowed_origins="*")

# EMOTES
emote_handler = Emotes(False)

# CHAT
announcer = SystemMessenger(display_name="Announcement", append_allow=False, save_in_history=True)
announcer.broadcast("Chat initialised.", predict_error=True)  # most likely no user connected

# REGEX
emote_regex = compile(r"(?<![\"\'\w()@/:_!?])[-!?:_/\w]+(?![\"\'\w()@/:_!?])", MULTILINE)
html_regex = compile(r"[<>]|&(?=[#\w]{1,5};)", MULTILINE)
link_regex = compile(r"(?:(https?)://)?([\w_-]+(?:(?:\.[\w_-]+)+))([^\s]*[^\s])?", MULTILINE)
youtube_regex = compile(r"(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|playlist\?|watch\?v=|watch\?.+(?:&|&#38;);v=))([a-zA-Z0-9\-_]{11})?(?:(?:[&?])t=(\d+))?")
image_regex = compile(r".+\.(?:jpg|gif|png|jpeg|bmp)$", IGNORECASE)
special_image_regex = compile(r"\.gifv$", IGNORECASE)
audio_regex = compile(r".+\.(?:mp3|wav|ogg)$", IGNORECASE)
video_regex = compile(r".+\.(?:mp4|ogg|webm)$", IGNORECASE)
newline_html_regex = compile(r'[\n\r]')
code_regex = compile(r"(```)(.+?|[\r\n]+?)(```)", MULTILINE)
quote_regex = compile(r"^&gt; (.+)", MULTILINE)


# Startup parameters
start_args = [x.strip().lower() for x in sys.argv]

login_disabled = cfg.get("logindisabled", False)  # default from cfg
if "-disablelogin" in start_args:  # overwrite by parameter
    login_disabled = True

if login_disabled:
    SHL.output(f"{red}Disabled authentication.{white}")

dummy_user = False
if "-dummyuser" in start_args:
    SHL.output(f"{red}Adding Dummy User{white}")
    dummy_user = True

debug_mode = cfg.get("debug_enabled", False)
if "-debug" in start_args:
    debug_mode = True

auth_service_url = os.environ.get("AUTHSERVICE", "https://auth2.zaanposni.com/")
if "--auth-service" in start_args:
    try:
        auth_service_url = sys.argv[sys.argv.index("--auth-service") + 1]
    except IndexError:
        pass
print(f"Using {auth_service_url} as auth service.")

if debug_mode:
    SHL.output(f"{red}Enabled debug_mode.{white}")


@auth.error_handler
def auth_error():
    if str(request.script_root + request.path).strip() != "/":
        return redirect(f"https://info.zaanposni.com/?redirect=https://chat.zaanposni.com{request.script_root + request.path}")
    return redirect(f"https://info.zaanposni.com/?redirect=https://chat.zaanposni.com")


@auth.verify_token
def verify_token(token):
    if login_disabled:
        return True
    token = request.cookies.get("access_token", token)
    SHL.output(f"Verify session with token: '{token}'.", "TokenAuth")
    try:
        ip = request.headers["X-Forwarded-For"]
    except KeyError:
        SHL.output(f"{red}Returning False, invalid headers.{white}", "TokenAuth")
        return False

    try:
        r = requests.get(f"{auth_service_url}/api/permission?permission=zaanposni.webaccess.chat",
                        headers={
                            'Cache-Control': 'no-cache',
                            'Authorization': f"Bearer {token}"
                        },
                        timeout=3)
    except Exception as ex:
        SHL.output(f"{red}Returning False, Communication with auth service failed:{white} {ex.__class__}")
        return False

    SHL.output(f"Response from auth service: {r.status_code}", "TokenAuth")
    if r.status_code == 200:
        SHL.output(f"{green2}Returning True.{white}", "TokenAuth")
        return True
    SHL.output(f"{red}Returning False, invalid session.{white}", "TokenAuth")
    return False


def get_username(token):
    r = requests.get(f"{auth_service_url}/api/user/lookup",
                     headers={
                         'Cache-Control': 'no-cache',
                         'Authorization': f'Bearer {request.cookies.get("access_token", token)}'
                     })

    if r.status_code != 200:
        return None

    return r.json()["username"]


from .commands import handle_command
from .sockets import emit_status  # TODO: dafuq is this, send help
from .import routes


# checking and creating upload dir
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    SHL.output(f"Upload folder was not present, created upload folder.", "Upload")

else:
    # cleaning upload folder
    SHL.output(f"Cleaning Upload folder.", "Upload")
    for the_file in os.listdir(app.config['UPLOAD_FOLDER']):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            SHL.output(f"{red} ERROR: Cleaning Upload folder., Reason: {e}{white}", "Upload")


# I left this for testing
if dummy_user:
    for name in {"ArPiiX", "SFFan123", "monkmitrad", "yannick"}:
        def_user = get_default_user()
        def_user.display_name = name
        def_user.username = name
        user_manager.add(f"qwertzuiopasdfghjk{name}", user=def_user)
