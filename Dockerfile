FROM node:10 as builder

WORKDIR /tsc-app
COPY package.json package-lock.json tsconfig.json tslint.json ./

# Install dependencies
RUN npm i typescript && npm i --no-bin-links --unsafe-perm=true

COPY /src/app/ts .

# Build in /dist which will later be copied
RUN $(npm bin)/tsc --outDir dist -p .



FROM python:3 as server

WORKDIR /srv

COPY /.git .
COPY /src .
COPY requirements.txt .

RUN python3 -m pip install -r ./requirements.txt

# Copy compiled javascript
COPY --from=builder /tsc-app/dist /srv/app/public/js/compiled/

CMD [ "python3", "./server.py", "--port", "80"]
EXPOSE 80
