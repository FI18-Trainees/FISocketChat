# -*- coding: utf-8 -*-
from flask import render_template, send_from_directory, request, make_response
from . import app, emotehandler, auth
from json import dumps as jdumps


@app.route('/')
@app.route('/index')
@auth.login_required
def index():
    return render_template('index.html')


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
    return jdumps(emotehandler.emotes, sort_keys=False)

