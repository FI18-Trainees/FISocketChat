# -*- coding: utf-8 -*-
import json
import os
from datetime import datetime
from hashlib import md5

from flask import render_template, send_from_directory, make_response, jsonify, request, url_for, flash
from werkzeug.utils import secure_filename

from app import app, emote_handler, auth, user_manager, chat_history
from app.obj import get_default_user
from utils import Console

SHL = Console("Routes")

uploaded_files = dict()


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


@app.route('/public/js/<path:path>')
def send_js(path):
    return send_from_directory(os.path.join('public', 'js'), path, mimetype='text/javascript')


@app.route('/public/img/<path:path>')
def send_img(path):
    return send_from_directory(os.path.join('public', 'img'), path, mimetype='image')


@app.route('/public/css/<path:path>')
def send_css(path):
    return send_from_directory(os.path.join('public', 'css'), path, mimetype='text/css')


@app.route('/api/emotes')
def send_emotes():
    sort = False
    sort = request.args.get('sort') is not None and request.args.get('sort').lower() == "true"
    emotes = emote_handler.emotes
    if sort:
        response = make_response(json.dumps(emotes, sort_keys=True))
        response.headers["mimetype"] = "application/json"
        response.headers["Content-Type"] = "application/json"
        return response
    return jsonify(emotes)


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


@app.route('/api/uploads/<filename>')
@auth.login_required
def uploaded_file(filename):
    return send_from_directory(os.path.join("storage", "uploads"), filename)


@app.route('/api/upload/', methods=['POST'])
@auth.login_required
def upload_file():
    if request.method == 'POST':
        SHL.output(f"[{get_ip(request)}] Uploads image", "/upload/")
        if 'file' not in request.files:
            flash('No file part')
            make_response("no file submitted", 400)
        file = request.files['file']

        if file.filename.strip() == '':
            make_response("no file submitted", 400)
        if file and allowed_file(file.filename):

            filename = secure_filename(str(datetime.now()) + "-" + file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

            filemd5 = __gen_md5(filename)
            if filemd5 in uploaded_files:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return uploaded_files.get(filemd5)['url']
            else:
                file_url = url_for('uploaded_file', filename=filename)
                uploaded_files.update({filemd5: {'url': file_url, 'date': datetime.now()}})
                return file_url


def allowed_file(filename):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def __gen_md5(fname):
    hash_md5 = md5()
    with open(os.path.join(app.config['UPLOAD_FOLDER'], fname), "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()
