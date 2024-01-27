import { ActiveUser, TicTacWoahServerSocket, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

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

export const identifyAllSocketsAsTheSameUser: (
	activeUser?: ActiveUser
) => TicTacWoahSocketServerMiddleware = activeUser => {
	const singleActiveUser = activeUser ?? {
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

export const identifySocketsInSequence: (
	activeUsers: ActiveUser[]
) => TicTacWoahSocketServerMiddleware = activeUsers => {
	let index = 0

	const identifySocketsInSequence: TicTacWoahSocketServerMiddleware = (socket, next) => {
		if (socket.data.activeUser) return next()

		const activeUser = activeUsers[index]
		activeUser.connections.add(socket)
		socket.data.activeUser = activeUser
		next()

		// Rotate the index
		index = (index + 1) % activeUsers.length
	}

	return identifySocketsInSequence
}
