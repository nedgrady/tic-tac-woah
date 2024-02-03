import { TicTacWoahSocketServerMiddleware, TicTacWoahUserHandle } from "TicTacWoahSocketServer"

export class TicTacWoahQueue {
	#queue: Set<TicTacWoahUserHandle> = new Set<TicTacWoahUserHandle>()

	add(user: TicTacWoahUserHandle) {
		this.#queue.add(user)
	}

	remove(user: TicTacWoahUserHandle) {
		this.#queue.delete(user)
	}

	get users() {
		return this.#queue
	}
}

export function addConnectionToQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("joinQueue", (joinQueueRequest, callback) => {
			queue.add(socket.data.activeUser.uniqueIdentifier)
			callback && callback(0)
		})
		next()
	}
}
