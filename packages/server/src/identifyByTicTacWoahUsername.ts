import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { ActiveUser } from "index"

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
