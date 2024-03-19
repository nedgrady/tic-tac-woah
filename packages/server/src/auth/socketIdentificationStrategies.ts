import { ActiveUser, TicTacWoahServerSocket, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

const activeUsers: Map<string, ActiveUser> = new Map<string, ActiveUser>()

export const identifyByTicTacWoahUsername: TicTacWoahSocketServerMiddleware = (socket, next) => {
	let activeUser = activeUsers.get(socket.handshake.auth.token)
	if (!activeUser) {
		activeUser = {
			uniqueIdentifier: socket.handshake.auth.token.toString(),
			connections: new Set(),
			objectId: crypto.randomUUID(),
		}
		activeUsers.set(socket.handshake.auth.token, activeUser)
	}
	socket.data.activeUser = activeUser
	activeUser.connections.add(socket)

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

export const identifySocketsByWebSocketId: TicTacWoahSocketServerMiddleware = (socket, next) => {
	const activeUser: ActiveUser = {
		connections: new Set(),
		uniqueIdentifier: socket.id,
	}
	activeUser.connections.add(socket)
	socket.data.activeUser = activeUser
	next()
}

export const removeConnectionFromActiveUser: TicTacWoahSocketServerMiddleware = (socket, next) => {
	socket.on("disconnect", () => {
		socket.data.activeUser.connections.delete(socket)
	})

	// TODO - consider removing from activeUsers if no connections here
	// this works for now, as an active user having an empty set will have
	// no side-effects.
	// if (socket.data.activeUser.connections.size === 0) {
	// 	activeUsers.delete(socket.data.activeUser.uniqueIdentifier)
	// }
	next()
}
