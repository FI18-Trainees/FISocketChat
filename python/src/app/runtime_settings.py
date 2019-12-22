import sys

from utils import Console, red, white, cfg

SHL = Console("SettingsInit")


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

if debug_mode:
    SHL.output(f"{red}Enabled debug_mode.{white}")
