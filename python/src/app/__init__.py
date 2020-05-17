# -*- coding: utf-8 -*-
import os
import shutil


from utils import Console, white, green2, red, cfg, blue2
from .runtime_settings import login_disabled, debug_mode, dummy_user
from .emotes import emote_handler
from .authentication import auth
from .obj import user_manager, get_default_user, user_limiter, SystemMessenger, SystemMessage, chat_history
from .chat_regex import *
from .commands import handle_command
from .flask_app import app
from .flask_limiter import limiter
from .sockets import emit_status
from .import routes
from .chat_utils import announcer

SHL = Console("Init")

announcer.broadcast("Chat initialised.", predict_error=True)

# checking and creating upload dir

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    SHL.output(f"{blue2}Upload folder was not present, created upload folder.{white}", "Upload")

else:
    # cleaning upload folder
    SHL.output(f"{blue2}Cleaning Upload folder.{white}", "Upload")
    for the_file in os.listdir(app.config['UPLOAD_FOLDER']):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            SHL.output(f"{red} ERROR: Cleaning Upload folder., Reason: {e}{white}", "Upload")


if dummy_user:
    if not cfg.get("dummy_user"):
        SHL.output(f"{red}No dummy user names set in config. Cannot add dummy users.{white}")
    else:
        for name in cfg.get("dummy_user", []):
            def_user = get_default_user()
            def_user.display_name = name
            def_user.username = name
            user_manager.add(f"qwertzuiopasdfghjk{name}", user=def_user)
