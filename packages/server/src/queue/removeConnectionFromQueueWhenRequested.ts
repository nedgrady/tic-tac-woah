import { TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { TicTacWoahQueue } from "queue/addConnectionToQueue"

export function removeConnectionFromQueueWhenRequested(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("leaveQueue", callback => {
			queue.remove(socket.data.activeUser)
			callback && callback(0)
		})
		next()
	}
}
