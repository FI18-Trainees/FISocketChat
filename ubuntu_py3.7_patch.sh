python3.7 -m pip freeze | xargs python3.7 -m pip uninstall -y
python3.7 -m ensurepip --upgrade
python3.7 -m pip install -r "requirements.txt"