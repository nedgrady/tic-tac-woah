import { Server as SocketIoServer } from "socket.io"
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "ticTacWoahServer.test"

export type TicTacWoahSocketServer = SocketIoServer<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>

export type TicTacWoahSocketServerMiddleware = Parameters<TicTacWoahSocketServer["use"]>[0]
