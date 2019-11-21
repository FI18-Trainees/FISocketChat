# -*- coding: utf-8 -*-
import os
from flask import render_template, send_from_directory, make_response, jsonify, request, url_for, flash, redirect

from app import app, emote_handler, auth, user_manager, chat_history
from app.obj import get_default_user
from utils import Console
from werkzeug.utils import secure_filename

SHL = Console("Routes")


def get_ip(r) -> str:
    return r.headers.get('X-Forwarded-For', r.remote_addr)


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
    SHL.output(f"[{get_ip(request)}] Returning: {r}", "/api/user")
    return jsonify(r)


@app.route('/api/chathistory')
@auth.login_required
def send_chat_history():
    SHL.output(f"[{get_ip(request)}] Returning chat history", "/api/chathistory")
    return jsonify(chat_history.to_json())


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join("storage", "uploads"), filename)


@app.route('/upload/', methods=['GET', 'POST'])
@auth.login_required
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            make_response("no file submitted", 400)
        file = request.files['file']

        if file.filename == '':
            make_response("no file submitted", 400)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return url_for('uploaded_file', filename=filename)
    return make_response("unsupported method", 400)


def allowed_file(filename):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

