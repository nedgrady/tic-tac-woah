import { Server as SocketIoServer, Socket as ServerSocket } from "socket.io"
import { type ClientToServerEvents, type ServerToClientEvents } from "types"

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

export type TicTacWoahRemoteServerSocket = Awaited<ReturnType<TicTacWoahSocketServer["fetchSockets"]>>[0]

export type TicTacWoahUserHandle = string

export interface ActiveUser {
	readonly connections: Set<TicTacWoahServerSocket>
	readonly uniqueIdentifier: TicTacWoahUserHandle
	readonly objectId?: string
}

export type TicTacWoahEventName = keyof ServerToClientEvents
export type TicTacWoahEventPayload<EventName extends TicTacWoahEventName> = Parameters<
	ServerToClientEvents[EventName]
>[0]
export type TicTacWoahEventMap = { [EventNameKey in TicTacWoahEventName]: TicTacWoahEventPayload<EventNameKey> }
