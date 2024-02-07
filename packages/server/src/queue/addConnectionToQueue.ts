import { ActiveUser, TicTacWoahSocketServerMiddleware, TicTacWoahUserHandle } from "TicTacWoahSocketServer"
import { EventEmitter } from "events"

export type QueueAddedListener = (queueState: ReadonlySet<TicTacWoahUserHandle>) => void

export class TicTacWoahQueue {
	readonly #queue: ActiveUser[] = []
	readonly #emitter: EventEmitter = new EventEmitter()
	objectId: string
	/**
	 *
	 */
	constructor() {
		this.objectId = crypto.randomUUID()
	}
	add(newUser: ActiveUser) {
		if (
			this.#queue.findIndex(
				userInQueueAlready => userInQueueAlready.uniqueIdentifier === newUser.uniqueIdentifier
			) !== -1
		)
			return
		this.#queue.push(newUser)
		this.#emitter.emit("Added", this.#queue)
	}

	onAdded(listener: QueueAddedListener) {
		this.#emitter.on("Added", listener)
	}

	remove(user: ActiveUser) {
		const id = user.uniqueIdentifier
		const index = this.#queue.findIndex(u => u.uniqueIdentifier === id)
		if (index === -1) return
		this.#queue.splice(index, 1)
	}

	get users(): readonly ActiveUser[] {
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
