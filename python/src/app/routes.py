# -*- coding: utf-8 -*-
import os
from datetime import datetime
from hashlib import sha1

from flask import render_template, send_from_directory, make_response, jsonify, request, url_for, flash
from werkzeug.utils import secure_filename

from app import app, emote_handler, auth, user_manager, chat_history, verify_token, login_disabled, cfg
from app.obj import get_default_user, ResourceManager
from utils import Console, red, white, cfg
from app.commands import commands

SHL = Console("Routes")

uploaded_files = dict()
resource_manager = ResourceManager(uploaded_files)
resource_manager.start_reloader()


def get_ip(r) -> str:
    return r.headers.get('X-Forwarded-For', r.remote_addr)


@app.route('/')
@app.route('/index')
@auth.login_required
def index():
    return send_from_directory('public', 'index.html') # customItems=cfg.get("sitebarCustomItems", {})


@app.route("/status")
def status():
    response = make_response("OK")
    response.headers["api"] = "hellothere"
    return response


@app.route("/favicon.ico")
def send_favicon():
    return send_from_directory('public', "favicon.ico", mimetype='image/x-icon"')


@app.route('/public/<path:path>')
def send_assets(path):
    mimetype = "text"
    if path.endswith(".js"):
        mimetype = "text/javascript"
    if path.endswith(".js.map"):
        mimetype = "application/json"
    if path.endswith(".html"):
        mimetype = "text/html"
    if path.endswith(".css"):
        mimetype = "text/css"
    if path.endswith(".eot"):
        mimetype = "application/vnd.ms-fontobject"
    if path.endswith(".svg"):
        mimetype = "image/svg+xml"
    if path.endswith(".ttf"):
        mimetype = "font/ttf"
    if path.endswith("woff"):
        mimetype = "font/woff"
    if path.endswith("woff2"):
        mimetype = "font/woff2"
    if "/img/" in path:
        mimetype = "image"
    return send_from_directory(os.path.join("public"), path, mimetype=mimetype)


@app.route('/api/emotes')
def send_emotes():
    return jsonify(emote_handler.emotes)


@app.route('/api/commands')
@auth.login_required
def send_commands_list():
    SHL.output(f"[{get_ip(request)}] Returning commands list", "/api/user")
    return jsonify(list(commands.keys()))


@app.route('/api/user')
@auth.login_required
def send_user():
    r = [x.get("user", get_default_user()).username for x in user_manager.configs.values()]
    SHL.output(f"[{get_ip(request)}] Returning: {r}", "/api/user")
    return jsonify(r)


@app.route('/api/chathistory')
def send_chat_history():
    if not login_disabled:
        actual_username = verify_token("")
        if not actual_username:
            SHL.output(f"[{get_ip(request)}] {red}Invalid login.{white}", "/api/chathistory")
            return jsonify([])
        req_username = request.args.get("username", "all")
        if req_username in ["all", actual_username]:
            SHL.output(f"[{get_ip(request)}] Returning chat history", "/api/chathistory")
            return jsonify(chat_history.to_json(username=req_username))
        SHL.output(f"[{get_ip(request)}] {red}Invalid username requested.{white}", "/api/chathistory")
        return jsonify([])
    SHL.output(f"[{get_ip(request)}] Returning chat history", "/api/chathistory")
    return jsonify(chat_history.to_json(username="all"))


@app.route('/api/sidebar')
def send_sidebar_info():
    SHL.output(f"[{get_ip(request)}] Returning sidebar info", "/api/sidebar")
    return jsonify(cfg.get("sidebarCustomItems", []))


@app.route('/api/uploads/<filename>')
@auth.login_required
def uploaded_file(filename):
    SHL.output(f"[{get_ip(request)}] Returning {filename} from uploads folder.", f"/api/uploads/{filename}")
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

            filemd5 = __gen_hash(filename)
            if filemd5 in uploaded_files:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return uploaded_files.get(filemd5)['url']
            else:
                file_url = url_for('uploaded_file', filename=filename)
                uploaded_files.update({filemd5: {'url': file_url, 'date': datetime.now(), 'path': filename}})
                return file_url


def allowed_file(filename):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def __gen_hash(fname):
    __hash = sha1()
    with open(os.path.join(app.config['UPLOAD_FOLDER'], fname), "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            __hash.update(chunk)
    return __hash.hexdigest()
