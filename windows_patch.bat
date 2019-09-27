pip freeze | xargs pip uninstall -y
python -m ensurepip --upgrade
pip install -r "requirements.txt"