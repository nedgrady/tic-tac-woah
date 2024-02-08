import { TicTacWoahQueue } from "./addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function removeConnectionFromQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("disconnect", () => {
			if (socket.data.activeUser.connections.size === 1) {
				queue.remove(socket.data.activeUser)
			}
		})

		next()
	}
}
