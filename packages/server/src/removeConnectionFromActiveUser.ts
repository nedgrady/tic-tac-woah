import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export const removeConnectionFromActiveUser: TicTacWoahSocketServerMiddleware = (socket, next) => {
	socket.on("disconnect", () => {
		socket.data.activeUser.connections.delete(socket)
	})
	next()
}
