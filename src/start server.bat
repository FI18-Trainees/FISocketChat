@echo off
cls
title FIChat
flask set FLASK_APP=server.py
flask run --with-threads
PAUSE
