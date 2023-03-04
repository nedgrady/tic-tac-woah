FROM node:18.14.2-alpine3.17

WORKDIR /app

# Top level
# TODO - copy the lockfile?
COPY package.json .

RUN npm install

COPY packages/server/package.json packages/server/package.json
RUN npm install -w server
COPY packages/server/ packages/server/
RUN npm run build -w server


COPY packages/client/package.json packages/client/package.json
RUN npm install -w client
COPY packages/client/ packages/client/
RUN npm run build -w client

ENV PATH_TO_CLIENT_BUILT_FOLDER=/app/packages/client/dist
ENV NODE_ENV=production

# COPY package.json ./dist
# COPY arena.env ./dist

COPY start.sh .

CMD ["sh", "start.sh"]

EXPOSE 8080
EXPOSE 80