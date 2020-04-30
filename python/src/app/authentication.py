import requests

from flask_httpauth import HTTPTokenAuth
from flask import redirect, request

from utils import Console, white, green2, red
from .runtime_settings import login_disabled

SHL = Console("AuthInit")
auth = HTTPTokenAuth(scheme='Bearer')


@auth.error_handler
def auth_error():
    if str(request.script_root + request.path).strip() != "/":
        return redirect(f"https://info.zaanposni.com/?redirect=https://chat.zaanposni.com{request.script_root + request.path}")
    return redirect(f"https://info.zaanposni.com/?redirect=https://chat.zaanposni.com")


@auth.verify_token
def verify_token(token):
    if login_disabled:
        return True

    token = request.cookies.get("access_token", token)
    SHL.output(f"Verify session with token: {token}.", "TokenAuth")
    try:
        ip = request.headers["X-Forwarded-For"]
    except KeyError:
        SHL.output(f"{red}Returning False, invalid headers.{white}", "TokenAuth")
        return False

    r = requests.get("https://auth2.zaanposni.com/api/permission?permission=zaanposni.webaccess.chat",
                     headers={
                         'Cache-Control': 'no-cache',
                         'Authorization': f"Bearer {token}"
                     })
    SHL.output(f"Response from auth service: {r.status_code}", "TokenAuth")
    if r.status_code == 200:
        SHL.output(f"{green2}Returning True.{white}", "TokenAuth")
        return r.text
    SHL.output(f"{red}Returning False, invalid session.{white}", "TokenAuth")
    return False


def get_username(token):
    r = requests.get(f"https://auth2.zaanposni.com/api/user/lookup",
                     headers={
                         'Cache-Control': 'no-cache',
                         'Authorization': f'Bearer {request.cookies.get("access_token", token)}'
                     })

    if r.status_code != 200:
        return None

    return r.json()["username"]
