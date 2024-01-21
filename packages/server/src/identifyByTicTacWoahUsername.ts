import { ArgumentsType } from "vitest"
import { Socket, Server as SocketIoServer } from "socket.io"

export const identifyByTicTacWoahUsername: ArgumentsType<SocketIoServer["use"]>[0] = (socket, next) => {
	console.log("==== socket.io auth", socket.handshake.auth.token)
	const set = new Set<Socket>()
	set.add(socket)
	socket.data.activeUser = {
		uniqueIdentifier: socket.handshake.auth.token,
		connections: set,
	}
	next()
}
