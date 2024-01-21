import { TicTacWoahServerSocket, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { ActiveUser } from "index"
import { Socket } from "socket.io"

const activeUsers: Map<string, ActiveUser> = new Map<string, ActiveUser>()

export const identifyByTicTacWoahUsername: TicTacWoahSocketServerMiddleware = (socket, next) => {
	let activeUser = activeUsers.get(socket.handshake.auth.token)

	if (!activeUser) {
		activeUser = {
			uniqueIdentifier: socket.handshake.auth.token,
			connections: new Set(),
		}
		activeUsers.set(socket.handshake.auth.token, activeUser)
	}
	activeUser.connections.add(socket)
	socket.data.activeUser = activeUser

	next()
}

export const identifyAllSocketsAsTheSameUserFactory: () => TicTacWoahSocketServerMiddleware = () => {
	const singleActiveUser = {
		uniqueIdentifier: "Single user from identifyAllSocketsAsTheSameUser",
		connections: new Set<TicTacWoahServerSocket>(),
	}

	const identifyAllSocketsAsTheSameUser: TicTacWoahSocketServerMiddleware = (socket, next) => {
		// userSockets is accessible here and persists between calls
		singleActiveUser.connections.add(socket)
		socket.data.activeUser = singleActiveUser
		next()
	}

	return identifyAllSocketsAsTheSameUser
}
