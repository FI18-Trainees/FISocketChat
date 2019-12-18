@echo off
cls
title FIChat
python server.py -disablelogin -dummyuser -debug --cfg-debug
PAUSE
