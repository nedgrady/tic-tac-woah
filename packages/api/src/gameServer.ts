import log from "loglevel"
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from 'http'
import { GameStart, Message, WebSocketCodes } from "@tic-tac-woah/types";

export interface Player {
    name: string
    id: string
    connection: WebSocket
}

export interface GameRequest {
    readonly player: Player
    readonly configuration: GameConfiguration
}

export interface GameConfiguration {
    playerCount: number
    boardSize: number
}

export class GameServer {

    readonly #queue : GameQueue

    constructor(
        webSocketServer: WebSocketServer,
        queue: GameQueue
    ) {
        this.#queue = queue
        webSocketServer.on('listening', this.listening.bind(this));
        webSocketServer.on('connection', this.connection.bind(this));
    }

    listening() {
        log.info("Server started")
    }

    connection(webSocket: WebSocket, request : IncomingMessage) {
        const requestUrl = new URL("http://anywhere" + request.url)

        const name = requestUrl.searchParams.get("name")
        const requestedPlayerCount = Number.parseInt(requestUrl.searchParams.get("playerCount") ?? "0")

        if(!name) {
            webSocket.close(WebSocketCodes.UNSUPPORTED_DATA, "")
            return
        }

        const gameRequest : GameRequest = {
            configuration: { boardSize: 10, playerCount: requestedPlayerCount },
            player: {
                connection: webSocket,
                name,
                id: "any id"
            }
        }

        var gameStartedMessage : GameStart = {
            type: "GAME_START"
        }

        //webSocket.send(JSON.stringify(gameStartedMessage))

        this.#queue.enqueue(gameRequest)
    }
}

export class GameQueue {

    readonly #items: GameRequest[] = []

    constructor() {
        
    }

    enqueue(gameRequest : GameRequest) {
        this.#items.push(gameRequest)
    }

    items() : readonly GameRequest[] {
        return this.#items
    }

    get(index : number) : GameRequest {
        return this.#items[index]
    }
}
