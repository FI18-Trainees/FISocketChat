from flask import render_template, send_from_directory, request
from app import app
from app.emotes import emotesToReplace


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', ip=request.remote_addr, emotes=emotesToReplace)


@app.route('/public/<path:path>')
def send_public(path):
    return send_from_directory('public', path)
