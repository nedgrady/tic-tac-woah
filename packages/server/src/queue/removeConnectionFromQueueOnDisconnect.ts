import { TicTacWoahSocketServerMiddleware } from "../TicTacWoahSocketServer"
import { TicTacWoahQueue } from "./addConnectionToQueue"

export function removeConnectionFromQueueOnDisconnect(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("disconnect", () => {
			if (socket.data.activeUser.connections.size === 1) {
				queue.remove(socket.data.activeUser)
			}
		})

		next()
	}
}
