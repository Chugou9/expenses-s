FROM node:16.13.1

RUN mkdir -p /app
WORKDIR /app
COPY ./package.json ./

RUN npm i
COPY . .

ENTRYPOINT npm run dev
EXPOSE 1337