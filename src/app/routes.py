# -*- coding: utf-8 -*-
from json import dumps as json_dumps

from flask import render_template, send_from_directory, request, make_response, Response

from . import app, emote_handler, auth


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
    return Response(json_dumps(emote_handler.emotes, sort_keys=False), mimetype='application/json') 

