FROM node:15.8.0

RUN mkdir -p /app
WORKDIR /app
COPY . /app

ENTRYPOINT  npm i --silent && npm run dev
EXPOSE 1337