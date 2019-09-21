from flask import render_template, send_from_directory, request
from app import app, emotehandler
from flask_httpauth import HTTPBasicAuth
import requests

auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username, password):
    r = requests.get("https://auth.zaanposni.com/verify",
                     auth=(username, password),
                     headers={'Cache-Control': 'no-cache'})
    if r.text == "OK":
        return True
    return False


@app.route('/')
@app.route('/index')
@auth.login_required
def index():
    return render_template('index.html', ip=request.remote_addr, emotes=emotehandler.emotes)


@app.route('/public/<path:path>')
@auth.login_required
def send_public(path):
    return send_from_directory('public', path)


@app.route('/api/emotes')
def send_emotes():
    return emotehandler.emotes

