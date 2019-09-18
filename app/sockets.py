from app import app, socketio
from flask_socketio import send, emit
import re
	
@socketio.on('chat_message')
def handle_message(message):
    msg = message[(message.find(';')+1):]
    usr = message[:(message.find(';')+1)]
    if msg.find('Server') == 0 or msg.find(':')>100:
        msg = msg[msg.find(':'):]
        res = '{invlaid username}' + msg
    if len(msg[(msg.find(':')+1):].strip())>0:
        msg = safe_tags_replace(msg)
        msg = safe_emote_replace(msg)
        emit('chat_message', usr + msg)
    	
	
tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
}

def replaceTag(tag):
    return tagsToReplace.get(tag, tag)


def safe_tags_replace(str):
    return re.sub(r"[&<>]", lambda x: replaceTag(x.group()), str, 0, re.MULTILINE)

	
	
emotesToReplace = {
    'Bosch' 		: '<img src="/public/img/bosch1.png" style="height: 32px; width: auto;" alt="Bosch" title="Bosch">',
    'Kappa' 		: '<img src="/public/img/Kappa1.png" style="height: 28px; width: auto;" alt="Kappa" title="Kappa">',
	'Shawn' 		: '<img src="/public/img/emote1.PNG" style="height:35px; width:auto;" alt="Shawn" title="Shawn">',
	'FeelsGoodMan' 	: '<img src="/public/img/FeelsGoodMan1.png" style="height:35px; width:auto;" alt="FeelsGoodMan" title="FeelsGoodMan">',
	'FeelsBadMan' 	: '<img src="/public/img/FeelsBadMan1.png" style="height:35px; width:auto;" alt="FeelsBadMan" title="FeelsBadMan">',
	'peepoWide' 	: '<img src="/public/img/peepoWide.png" style="height:35px; width:auto;" alt="peepoWide" title="peepoWide">',
	'Hackerman' 	: '<img src="/public/img/hackerman.jpg" style="height:100px; width:auto;" alt="Hackerman" title="hackerman">',
	'D:' 			: '<img src="/public/img/OMG1.png" style="height:32px; width:auto;" alt="D:" title="D:">',
	'SourPls' 		: '<img src="/public/img/SourPls.gif" style="height:32px; width:auto;" alt="SourPls" title="SourPls">',
	'ricadoFlick' 	: '<img src="/public/img/ricadoFlick.gif" style="height:32px; width:auto;" alt="ricadoFlick" title="ricadoFlick">',
	'Pog' 			: '<img src="/public/img/Pog.png" style="height:32px; width:auto;" alt="Pog" title="Pog">',
	'peepoClap' 	: '<img src="/public/img/peepoClap.gif" style="height:32px; width:auto;" alt="peepoClap" title="peepoClap">',
	'bongoCat' 		: '<img src="/public/img/bongoCat.gif" style="height:50px; width:auto;" alt="bongoCat" title="bongoCat">',
	'sumSmash' 		: '<img src="/public/img/sumSmash.gif" style="height:32px; width:auto;" alt="sumSmash" title="sumSmash">',
	'forsenCD' 		: '<img src="/public/img/forsenCD.png" style="height:32px; width:auto;" alt="forsenCD" title="forsenCD">',
	'forsenPls' 	: '<img src="/public/img/forsenPls.gif" style="height:32px; width:auto;" alt="forsenPls" title="forsenPls">',
	'LuL' 			: '<img src="/public/img/LuL.png" style="height:32px; width:auto;" alt="LuL" title="LuL">',
	'Pepega' 		: '<img src="/public/img/Pepega.png" style="height:32px; width:auto;" alt="Pepega" title="Pepega">',
	'monkaS' 		: '<img src="/public/img/monkaS.png" style="height:32px; width:auto;" alt="monkaS" title="monkaS">',
	'OMEGALUL' 		: '<img src="/public/img/OMEGALUL.png" style="height:32px; width:auto;" alt="OMEGALUL" title="OMEGALUL">',
	'pepeJAM' 		: '<img src="/public/img/pepeJAM.gif" style="height:32px; width:auto;" alt="pepeJAM" title="pepeJAM">',
	'weSmart' 		: '<img src="/public/img/weSmart.png" style="height:32px; width:auto;" alt="weSmart" title="weSmart">',
	'monkaHmm' 		: '<img src="/public/img/monkaHmm.png" style="height:32px; width:auto;" alt="monkaHmm" title="monkaHmm">',
	'monkaW' 		: '<img src="/public/img/monkaW.png" style="height:32px; width:auto;" alt="monkaW" title="monkaW">',
	'CrabPls' 		: '<img src="/public/img/CrabPls.gif" style="height:32px; width:auto;" alt="CrabPls" title="CrabPls">',
	'Clap' 			: '<img src="/public/img/Clap.gif" style="height:32px; width:auto;" alt="Clap" title="Clap">',
	'/shrug'		: '¯\\_(ツ)_/¯',
  	'/flip'			: '(╯°□°）╯︵ ┻━┻',
}

def replaceEmote(emote):
    return emotesToReplace.get(emote, emote)


def safe_emote_replace(str):
    return re.sub(r"[\"'\/]?[\/:\w]+[\"'\/]?", lambda x: replaceEmote(x.group()), str, 0, re.MULTILINE)
