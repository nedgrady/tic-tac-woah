FROM node:18.14.2-alpine3.17

ARG RENDER_WEBSOCKET_URL=https://tic-tac-woah.onrender.com/
ARG RENDER_WEBSOCKET_PORT=80
ARG RENDER_API_URL=https://tic-tac-woah.onrender.com/
ARG RENDER_API_PORT=443

WORKDIR /app

RUN printenv

# Top level
# TODO - copy the lockfile?
COPY package.json .

RUN npm install

# Server
COPY packages/types/package.json packages/types/package.json
RUN npm install -w types
COPY packages/types/ packages/types/
# RUN npm run build -w types

ENV VITE_WEBSOCKET_URL=$RENDER_WEBSOCKET_URL
ENV VITE_WEBSOCKET_PORT=$RENDER_WEBSOCKET_PORT
ENV VITE_API_URL=$RENDER_API_URL
ENV VITE_API_PORT=$RENDER_API_PORT

# Server
COPY packages/server/package.json packages/server/package.json
RUN npm install -w server
COPY packages/server/ packages/server/
RUN npm run build -w server


# Client
COPY packages/client/package.json packages/client/package.json
RUN npm install -w client
COPY packages/client/ packages/client/
RUN npm run build -w client

ENV PATH_TO_CLIENT_BUILT_FOLDER=/app/packages/client/dist
ENV NODE_ENV=production

COPY start.sh .

CMD ["sh", "start.sh"]

EXPOSE 8080
EXPOSE 80