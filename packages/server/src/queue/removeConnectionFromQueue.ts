import { TicTacWoahQueue } from "./addConnectionToQueue"
import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export function removeConnectionFromQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("disconnect", () => {
			console.log("==== socket.io disconnect", socket.id, socket.data.activeUser.connections.size)
			if (socket.data.activeUser.connections.size === 1) {
				queue.remove(socket.data.activeUser)
			}
		})

		next()
	}
}
