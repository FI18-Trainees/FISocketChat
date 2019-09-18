from flask import render_template, request, send_from_directory
from app import app
import requests

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')
	
@app.route('/public/<path:path>')
def send_public(path):
    return send_from_directory('public', path)
	
