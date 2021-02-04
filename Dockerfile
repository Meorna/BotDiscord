FROM node:latest

ADD main.js /usr/src/app/
ADD .env /usr/src/app/

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

CMD [ "node", "main.js" ]