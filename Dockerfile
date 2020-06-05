FROM node:10 as builder

COPY package.json package-lock.json tsconfig.json tslint.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i typescript && npm i --no-bin-links --unsafe-perm=true && mkdir /tsc-app && mv ./node_modules /tsc-app

WORKDIR /tsc-app

## Build the angular app in production mode and store the artifacts in dist folder
RUN $(npm bin)/tsc --outDir dist


FROM python:3 as server

WORKDIR /python


COPY /src .
COPY requirements.txt .

RUN python3 -m pip install -r ./requirements.txt

COPY --from=builder /tsc-app/dist /python/src/app/public/js/compiled/

CMD [ "python3", "./server.py", "--port", "80"]
EXPOSE 80
