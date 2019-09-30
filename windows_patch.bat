pip freeze > unins && pip uninstall -y -r unins && del unins
python -m ensurepip --upgrade
pip install -r "requirements.txt"
