FROM node:16.17

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

CMD node index.js