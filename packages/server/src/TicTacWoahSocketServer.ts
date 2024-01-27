import { type Socket as ClientSocket } from "socket.io-client"
import { JoinQueueRequest } from "types"
import { Server as SocketIoServer, Socket as ServerSocket } from "socket.io"

export interface ServerToClientEvents {
	noArg: () => void
	basicEmit: (a: number, b: string, c: Buffer) => void
	withAck: (d: string, callback: (e: number) => void) => void
}
export type AckCallback = (e: number) => void

export interface ClientToServerEvents {
	joinQueue(joinQueueRequest: JoinQueueRequest, callback?: AckCallback): void
}

export interface InterServerEvents {
	ping: () => void
}

export interface SocketData {
	activeUser: ActiveUser
	sockets: Set<ServerSocket>
}

export type TicTacWoahSocketServer = SocketIoServer<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>

export type TicTacWoahServerSocket = ServerSocket<ClientToServerEvents, ServerToClientEvents, SocketData>

export type TicTacWoahSocketServerMiddleware = Parameters<TicTacWoahSocketServer["use"]>[0]

export type TicTacWoahClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>

export interface ActiveUser {
	readonly connections: Set<TicTacWoahServerSocket>
	readonly uniqueIdentifier: string
}
