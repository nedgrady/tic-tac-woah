import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"

export class TicTacWoahQueue {
	#queue: Set<ActiveUser> = new Set<ActiveUser>()

	add(user: ActiveUser) {
		this.#queue.add(user)
	}

	remove(user: ActiveUser) {
		this.#queue.delete(user)
	}

	get users() {
		return this.#queue
	}
}

export function addConnectionToQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("joinQueue", (joinQueueRequest, callback) => {
			queue.add(socket.data.activeUser)
			callback && callback(0)
		})
		next()
	}
}
