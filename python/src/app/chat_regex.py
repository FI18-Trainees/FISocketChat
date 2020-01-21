from re import compile as __compile
from re import MULTILINE as __MULTILINE
from re import IGNORECASE as __IGNORECASE

emote_regex = __compile(r"(?<![\"\'\w()@/:_!?])[-!?:_/\w]+(?![\"\'\w()@/:_!?])", __MULTILINE)
html_regex = __compile(r"[<>]|&(?=[#\w]{1,5};)", __MULTILINE)
link_regex = __compile(r"(?:(https?)://)?([\w_-]+(?:(?:\.[\w_-]+)+))([^\s\'\"]*[^\s\'\"])?", __MULTILINE)
youtube_regex = __compile(r"(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|playlist\?|watch\?v=|watch\?.+(?:&|&#38;);v=))([a-zA-Z0-9\-_]{11})?(?:(?:[&?])t=(\d+))?")
image_regex = __compile(r".+\.(?:jpg|gif|png|jpeg|bmp)$", __IGNORECASE)
special_image_regex = __compile(r"\.gifv$", __IGNORECASE)
audio_regex = __compile(r".+\.(?:mp3|wav|ogg)$", __IGNORECASE)
video_regex = __compile(r".+\.(?:mp4|ogg|webm)$", __IGNORECASE)
newline_html_regex = __compile(r'[\n\r]')
code_regex = __compile(r"(```)(.+?|[\r\n]+?)(```)", __MULTILINE)
quote_regex = __compile(r"^&gt; (.+)", __MULTILINE)
