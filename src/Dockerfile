FROM python:3

WORKDIR /app


COPY ./src .
COPY ./requirements.txt .

RUN pip3 install -r ./requirements.txt


CMD [ "python3", "./server.py" ]
#CMD [ "python3", "./server.py", "-disablelogin" ]