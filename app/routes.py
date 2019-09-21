# -*- coding: utf-8 -*-
from flask import render_template, send_from_directory, request
from flask import render_template, send_from_directory, request, make_response, redirect
from app import app, emotehandler
from flask_httpauth import HTTPTokenAuth
import requests

auth = HTTPTokenAuth()


@auth.error_handler
def auth_error():
    return redirect("https://info.zaanposni.com", code=401)


@auth.verify_token
def verify_password(token):
    token = request.cookies.get("access_token", "")
    r = requests.get("https://auth.zaanposni.com/verify",
                     headers={
                         'Cache-Control': 'no-cache',
                         'X-Auth-For': request.headers["X-Forwarded-For"],
                         'Authorization': f"Bearer {token}"
                             })
    if r.text == "OK":
        return True
    return False


@app.route('/')
@app.route('/index')
@auth.login_required
def index():
    return render_template('index.html', ip=request.remote_addr, emotes=emotehandler.emotes)


@app.route("/status")
def status():
    response = make_response("OK")
    response.headers["api"] = "hellothere"
    return response


@app.route('/public/<path:path>')
def send_public(path):
    return send_from_directory('public', path)


@app.route('/api/emotes')
def send_emotes():
    return emotehandler.emotes

