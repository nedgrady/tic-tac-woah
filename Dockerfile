FROM node:18.14.2-alpine3.17

WORKDIR /app

# Top level
# TODO - copy the lockfile?
COPY package.json

COPY packages/server/package.json .

RUN npm install -w server

COPY packages/server/ .

RUN npm run build -w server

ENV NODE_ENV=production

# COPY package.json ./dist
# COPY arena.env ./dist

COPY start.sh .

CMD ["sh", "start.sh"]

EXPOSE 8080
EXPOSE 80