FROM node:18.14.2-alpine3.17

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

COPY package.json ./dist
COPY arena.env ./dist

CMD ["sh", "start.sh"]

EXPOSE 8080
EXPOSE 80