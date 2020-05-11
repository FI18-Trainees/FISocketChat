import sys

from utils import Console, red, white, cfg, yellow, blue2

SHL = Console("SettingsInit")


start_args = [x.strip().lower() for x in sys.argv]
login_disabled = cfg.get("logindisabled", False)  # default from cfg
if "-disablelogin" in start_args:  # overwrite by parameter
    login_disabled = True

if login_disabled:
    SHL.output(f"{blue2}Disabled authentication.{white}")

dummy_user = False
if "-dummyuser" in start_args:
    SHL.output(f"{blue2}Adding Dummy User{white}")
    dummy_user = True

debug_mode = cfg.get("debug_enabled", False)
if "-debug" in start_args:
    debug_mode = True

if debug_mode:
    SHL.output(f"{blue2}Enabled debug_mode.{white}")

auth_service_url = "https://auth2.zaanposni.com"
if "-authservice" in start_args:
        try:
            auth_service_url = sys.argv[sys.argv.index("-authservice") + 1]
        except IndexError:
            pass
SHL.output(f"{blue2}Using authentication service at: '{auth_service_url}'.{white}")

if "-unittest" in start_args:
    SHL.output(f"{blue2}Enabled unittest mode.{white}")
    login_disabled = True
    dummy_user = False
    debug_mode = False
    cfg.load_unittest_config()
