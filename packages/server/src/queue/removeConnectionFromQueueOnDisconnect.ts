import { TicTacWoahQueue } from "./addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function removeConnectionFromQueueOnDisconnect(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("disconnect", () => {
			if (socket.data.activeUser.connections.size === 1) {
				queue.removeUser(socket.data.activeUser)
			}
		})

		next()
	}
}
