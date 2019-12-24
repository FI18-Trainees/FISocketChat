import sys
import logging

from utils import Console, white, blue2

SHL = Console("Startup")

if "-log" in [x.strip().lower() for x in sys.argv]:
    SHL.output(f"{blue2}Setting loggers to info level.{white}")
else:
    SHL.output(f"{blue2}Setting loggers to error level.{white}")
    logging.getLogger('socketio').setLevel(logging.ERROR)
    logging.getLogger('socketio.server').setLevel(logging.ERROR)
    logging.getLogger('socketio.client').setLevel(logging.ERROR)
    logging.getLogger('engineio').setLevel(logging.ERROR)
    logging.getLogger('engineio.server').setLevel(logging.ERROR)
    logging.getLogger('engineio.client').setLevel(logging.ERROR)
