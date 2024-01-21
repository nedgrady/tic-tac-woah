import { type Socket as ServerSocket, type Server as SocketIoServer } from "socket.io"
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "ticTacWoahServer.test"
import { type Socket as ClientSocket } from "socket.io-client"

export type TicTacWoahSocketServer = SocketIoServer<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>

export type TicTacWoahServerSocket = ServerSocket<ClientToServerEvents, ServerToClientEvents, SocketData>

export type TicTacWoahSocketServerMiddleware = Parameters<TicTacWoahSocketServer["use"]>[0]

export type TicTacWoahClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>
