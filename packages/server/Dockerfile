FROM node:18.14.2-alpine3.17

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

CMD npm run server:prod

EXPOSE 8080