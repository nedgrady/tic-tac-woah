import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { EventEmitter } from "events"

export type QueueAddedListener = (queueState: readonly QueueEntry[]) => void

export interface QueueEntry {
	humanCount: number
	botCount: number
	boardSize: number
	consecutiveTarget: number
	queuer: ActiveUser
}

export class TicTacWoahQueue {
	readonly #queue: QueueEntry[] = []
	readonly #emitter: EventEmitter = new EventEmitter()
	objectId: string

	constructor() {
		this.objectId = crypto.randomUUID()
	}

	add(newQueueEntry: QueueEntry) {
		if (
			this.#queue.findIndex(
				existingQueueEntry =>
					existingQueueEntry.queuer.uniqueIdentifier === newQueueEntry.queuer.uniqueIdentifier
			) !== -1
		)
			return
		this.#queue.push(newQueueEntry)
		this.#emitter.emit("Added", [...this.#queue])
	}

	onAdded(listener: QueueAddedListener) {
		this.#emitter.on("Added", listener)
	}

	removeUser(user: ActiveUser) {
		const id = user.uniqueIdentifier
		const index = this.#queue.findIndex(q => q.queuer.uniqueIdentifier === id)
		if (index === -1) return
		this.#queue.splice(index, 1)
	}

	dequeueEntry(queueEntry: QueueEntry) {
		const index = this.#queue.indexOf(queueEntry)
		if (index === -1) return
		this.#queue.splice(index, 1)
	}

	get users(): readonly ActiveUser[] {
		return this.#queue.map(q => q.queuer)
	}
}

export function addConnectionToQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("joinQueue", (joinQueueRequest, callback) => {
			const queueEntry: QueueEntry = {
				queuer: socket.data.activeUser,
				...joinQueueRequest,
			}
			queue.add(queueEntry)
			callback && callback(0)
		})

		next()
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function loggedMethod(_target: any, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
	const originalMethod = descriptor.value

	function replacementMethod(this: any, ...args: any[]) {
		if (isActiveUser(args[0])) {
			console.log(`Active user: ${args[0].uniqueIdentifier}`)
		}

		console.log(`Calling ${_propertyKey} with`, args)
		const result = originalMethod.apply(this, args)

		return result
	}

	descriptor.value = replacementMethod
	return descriptor

	function isActiveUser(value: any): value is ActiveUser {
		return (
			typeof value === "object" &&
			value !== null &&
			value.connections instanceof Set &&
			typeof value.uniqueIdentifier === "string" &&
			(typeof value.objectId === "string" || typeof value.objectId === "undefined")
		)
	}
}
/* eslint-enable @typescript-eslint/no-explicit-any */
