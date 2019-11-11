# -*- coding: utf-8 -*-
from flask import render_template, send_from_directory, make_response, jsonify

from . import app, emote_handler, auth, user_manager
from.obj import default_user

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
    return jsonify(emote_handler.emotes)


@app.route('/api/user')
def send_user():
    return jsonify([x.get("user", default_user).username for x in user_manager.configs.values()])
