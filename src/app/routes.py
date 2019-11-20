# -*- coding: utf-8 -*-
from flask import render_template, send_from_directory, make_response, jsonify, request

from . import app, emote_handler, auth, user_manager, chat_history
from .obj import get_default_user
from utils.shell import Console

SHL = Console("Routes")


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
@auth.login_required
def send_user():
    r = [x.get("user", get_default_user()).username for x in user_manager.configs.values()]
    SHL.output(f"[{request.headers.get('X-Forwarded-For', request.remote_addr)}] Returning: {r}", "/api/user")
    return jsonify(r)


@app.route('/api/chathistory')
@auth.login_required
def send_chat_history():
    return jsonify(chat_history.to_json())
